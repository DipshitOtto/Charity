const pxls = require('../pxls');

const fs = require('fs');
const FileType = require('file-type');
const DWebp = require('cwebp').DWebp;
const Jimp = require('jimp');

module.exports = {
	async board(x = 0, y = 0, width, height) {
		const board = pxls.board();
		if((x === undefined || x === null) && (y === undefined || y === null) && (width === undefined || width === null) && (height === undefined || height === null)) {
			return board.getBufferAsync(Jimp.MIME_PNG);
		}
		if (width === undefined || width === null) width = board.bitmap.width;
		if (height === undefined || height === null) height = board.bitmap.height;

		let generated;
		await Jimp.read(board).then(image => {
			image.crop(x, y, width, height);
			generated = image.getBufferAsync(Jimp.MIME_PNG);
		});

		return generated;
	},
	async reduce(buffer, palette) {
		const fileType = await FileType.fromBuffer(buffer);
		if (fileType.mime === 'image/webp') {
			const decoder = new DWebp(buffer);
			buffer = await decoder.toBuffer();
		}
		let generated;
		await Jimp.read(buffer).then(async (image) => {
			await image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
				const red = this.bitmap.data[idx + 0];
				const green = this.bitmap.data[idx + 1];
				const blue = this.bitmap.data[idx + 2];

				let closestColor = palette[0].value;
				let closestColorDifference;
				for (let i = 0; i < palette.length; i++) {
					let colorDifference = 0;
					const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(palette[i].value);
					colorDifference += Math.pow(red - parseInt(color[1], 16), 2);
					colorDifference += Math.pow(green - parseInt(color[2], 16), 2);
					colorDifference += Math.pow(blue - parseInt(color[3], 16), 2);
					colorDifference = Math.sqrt(colorDifference);
					if (colorDifference <= closestColorDifference || closestColorDifference === undefined || closestColorDifference === null) {
						closestColor = {
							r: parseInt(color[1], 16),
							g: parseInt(color[2], 16),
							b: parseInt(color[3], 16),
						};
						closestColorDifference = colorDifference;
					}
				}
				image.bitmap.data[idx + 0] = closestColor.r;
				image.bitmap.data[idx + 1] = closestColor.g;
				image.bitmap.data[idx + 2] = closestColor.b;
			});
			generated = image.getBufferAsync(Jimp.MIME_PNG);
		}).catch(err => console.error(err));
		return generated;
	},
	async detemplatize(buffer, width, height, scaleFactor) {
		const fileType = await FileType.fromBuffer(buffer);
		if (fileType.mime === 'image/webp') {
			const decoder = new DWebp(buffer);
			buffer = await decoder.toBuffer();
		}
		let generated;
		await Jimp.read(buffer).then(async (image) => {
			if (scaleFactor === undefined || scaleFactor === null) scaleFactor = image.bitmap.width / width;
			if (height === undefined || height === null) height = image.bitmap.height / scaleFactor;
			generated = await new Jimp(width, height);
			for (let x = 0; x < width; x++) {
				for (let y = 0; y < height; y++) {
					let color = null;
					for (let px = x * scaleFactor; px < x * scaleFactor + scaleFactor; px++) {
						for (let py = y * scaleFactor; py < y * scaleFactor + scaleFactor; py++) {
							if (color === null) {
								let pixelColor = '0x' + (image.getPixelColor(px, py) >>> 0).toString(16).padStart(8, '0');
								if(x == 0 && y == 0) {
									const a = parseInt('0x' + pixelColor.substring(8));
									pixelColor = pixelColor.substring(0, pixelColor.length - 2) + (a < 128 ? 0 : 255).toString(16).padStart(2, '0');
								}
								if(pixelColor.slice(pixelColor.length - 2) != '00') {
									color = parseInt(pixelColor.substring(pixelColor.length - 2, 0) + 'ff');
								} else {
									color = null;
								}
							}
						}
					}
					if (color != null) generated.setPixelColor(color, x, y);
				}
			}
		}).catch(err => console.error(err));
		return generated.getBufferAsync(Jimp.MIME_PNG);
	},
	async parsePalette(array, palette, width, height) {
		const generated = await new Jimp(width, height);
		generated.scan(0, 0, width, height, function(x, y, idx) {
			const index = array[generated.bitmap.width * y + x];
			if(index === 255) return;
			const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(palette[index].value);
			generated.bitmap.data[idx] = parseInt(color[1], 16);
			generated.bitmap.data[idx + 1] = parseInt(color[2], 16);
			generated.bitmap.data[idx + 2] = parseInt(color[3], 16);
			generated.bitmap.data[idx + 3] = 255;
		});
		return generated.getBufferAsync(Jimp.MIME_PNG);
	},
	async diffImages(template, actual) {
		template = await Jimp.read(template);
		actual = await Jimp.read(actual);

		const image = await new Jimp(template.bitmap.width, template.bitmap.height);
		let generated;
		let totalPixels = 0;
		let correctPixels = 0;
		let toGoPixels = 0;

		template.scan(0, 0, template.bitmap.width, template.bitmap.height, function(x, y, idx) {
			if (template.bitmap.data[idx + 3] != 0) {
				totalPixels++;
				if (template.bitmap.data[idx] === actual.bitmap.data[idx] && template.bitmap.data[idx + 1] === actual.bitmap.data[idx + 1] && template.bitmap.data[idx + 2] === actual.bitmap.data[idx + 2]) {
					correctPixels++;
					image.setPixelColor(0x00FF00FF, x, y);
				} else {
					toGoPixels++;
					image.setPixelColor(0xFF0000FF, x, y);
				}
			}
		});

		await image.getBufferAsync(Jimp.MIME_PNG).then(buffer => {
			generated = buffer;
		});

		const data = {
			generated: generated,
			totalPixels: totalPixels,
			correctPixels: correctPixels,
			toGoPixels: toGoPixels,
			percentageComplete: Math.round(((totalPixels - toGoPixels) / totalPixels * 100 + Number.EPSILON) * 100) / 100,
		};

		return data;
	},
	async scaleFactor(buffer, width) {
		const fileType = await FileType.fromBuffer(buffer);
		if (fileType.mime === 'image/webp') {
			const decoder = new DWebp(buffer);
			buffer = await decoder.toBuffer();
		}
		let result;
		await Jimp.read(buffer).then(image => {
			result = image;
		});
		return result.bitmap.width / width;
	},
	async height(buffer, scaleFactor) {
		const fileType = await FileType.fromBuffer(buffer);
		if (fileType.mime === 'image/webp') {
			const decoder = new DWebp(buffer);
			buffer = await decoder.toBuffer();
		}
		let result;
		await Jimp.read(buffer).then(image => {
			result = image;
		});
		return result.bitmap.height / scaleFactor;
	},
	async templateSource(buffer, palette) {
		const fileType = await FileType.fromBuffer(buffer);
		if (fileType.mime === 'image/webp') {
			const decoder = new DWebp(buffer);
			buffer = await decoder.toBuffer();
		}
		const generated = [];
		await Jimp.read(buffer).then(async (image) => {
			await image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
				const red = this.bitmap.data[idx + 0];
				const green = this.bitmap.data[idx + 1];
				const blue = this.bitmap.data[idx + 2];
				const alpha = this.bitmap.data[idx + 3];

				if (alpha === 0) return generated.push(255);

				let closestColor = 255;
				let closestColorDifference;
				for (let i = 0; i < palette.length; i++) {
					let colorDifference = 0;
					const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(palette[i].value);
					colorDifference += Math.pow(red - parseInt(color[1], 16), 2);
					colorDifference += Math.pow(green - parseInt(color[2], 16), 2);
					colorDifference += Math.pow(blue - parseInt(color[3], 16), 2);
					colorDifference = Math.sqrt(colorDifference);
					if (colorDifference <= closestColorDifference || closestColorDifference === undefined || closestColorDifference === null) {
						closestColor = i;
						closestColorDifference = colorDifference;
					}
				}
				generated.push(closestColor);
			});
		}).catch(err => console.error(err));
		return generated;
	},
	async color(color) {
		if(color.match(/^[a-fA-F0-9]{3}$/g)) {
			color = ('#' + color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2)).toUpperCase();
		} else if(color.match(/^#[a-fA-F0-9]{3}$/g)) {
			color = ('#' + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3)).toUpperCase();
		} else if(color.match(/^[a-fA-F0-9]{6}$/g)) {
			color = ('#' + color.charAt(0) + color.charAt(1) + color.charAt(2) + color.charAt(3) + color.charAt(4) + color.charAt(5)).toUpperCase();
		} else if(color.match(/^#[a-fA-F0-9]{6}$/g)) {
			color = ('#' + color.charAt(1) + color.charAt(2) + color.charAt(3) + color.charAt(4) + color.charAt(5) + color.charAt(6)).toUpperCase();
		} else if(color.match(/^(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5]),(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5]),(1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$/g)) {
			color = ('#' + parseInt(color.split(',')[0]).toString(16) + parseInt(color.split(',')[1]).toString(16) + parseInt(color.split(',')[2]).toString(16)).toUpperCase();
		} else {
			const colors = fs.readFileSync('src/assets/colors.json');
			const palette = JSON.parse(colors);
			color = palette.find(c => {return c.name.toLowerCase() === color.toLowerCase();});
			if(color) {
				color = color.value;
			} else {
				return null;
			}
		}

		const generated = new Jimp(192, 192, color);

		const r = parseInt(color.substring(1, 3), 16);
		const g = parseInt(color.substring(3, 5), 16);
		const b = parseInt(color.substring(5, 7), 16);
		const uicolors = [r / 255, g / 255, b / 255];
		const c = uicolors.map((col) => {
			if (col <= 0.03928) {
				return col / 12.92;
			}
			return Math.pow((col + 0.055) / 1.055, 2.4);
		});
		const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
		const fnt = (L > 0.179) ? 'src/assets/fonts/charity_8_black.fnt' : 'src/assets/fonts/charity_8_white.fnt';

		const colors = fs.readFileSync('src/assets/colors.json');
		const palette = JSON.parse(colors);
		let closestColor = palette[0].value;
		let closestColorDifference;
		for (let i = 0; i < palette.length; i++) {
			let colorDifference = 0;
			const paletteColor = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(palette[i].value);
			colorDifference += Math.pow(r - parseInt(paletteColor[1], 16), 2);
			colorDifference += Math.pow(g - parseInt(paletteColor[2], 16), 2);
			colorDifference += Math.pow(b - parseInt(paletteColor[3], 16), 2);
			colorDifference = Math.sqrt(colorDifference);
			if (colorDifference <= closestColorDifference || closestColorDifference === undefined || closestColorDifference === null) {
				closestColor = palette[i];
				closestColorDifference = colorDifference;
			}
		}

		await Jimp.loadFont(fnt).then(font => {
			generated.print(font, 10, 10, closestColor.name);
			(closestColor.value.toLowerCase() === color.toLowerCase()) ? generated.print(font, 10, 20, '(exact match)') : generated.print(font, 10, 20, '(inexact match)');
			generated.print(font, 10, 40, color);
			generated.print(font, 10, 60, `R: ${r}`);
			generated.print(font, 10, 70, `G: ${g}`);
			generated.print(font, 10, 80, `B: ${b}`);
		});

		return generated.getBufferAsync(Jimp.MIME_PNG);
	},
	async cropToBoard(template, x, y) {
		const board = pxls.board();
		// crop top-left
		const minX = x >= 0 ? 0 : -x;
		const minY = y >= 0 ? 0 : -y;
		template.crop(minX, minY, template.bitmap.width - minX, template.bitmap.height - minY);
		x = Math.max(0, x);
		y = Math.max(0, y);
		// crop bottom-right
		const height = y + template.bitmap.height > board.bitmap.height ? board.bitmap.height - y : template.bitmap.height;
		const width = x + template.bitmap.width > board.bitmap.width ? board.bitmap.width - x : template.bitmap.width;
		template.crop(0, 0, width, height);
		return {
			image: template,
			ox: x,
			oy: y,
		};
	},
	async layer(templates) {
		const board = pxls.board();
		const layered = await new Jimp(board.bitmap.width, board.bitmap.height);
		let minX = board.bitmap.width;
		let minY = board.bitmap.height;
		let maxX = 0;
		let maxY = 0;

		for(let i = templates.length - 1; i >= 0; i--) {
			const croppedTemplate = await this.cropToBoard(await Jimp.read(templates[i].image), templates[i].ox, templates[i].oy);
			layered.composite(croppedTemplate.image, croppedTemplate.ox, croppedTemplate.oy);
			const height = croppedTemplate.image.bitmap.height;
			const width = croppedTemplate.image.bitmap.width;
			if(croppedTemplate.ox < minX) minX = croppedTemplate.ox;
			if(croppedTemplate.oy < minY) minY = croppedTemplate.oy;
			if((croppedTemplate.ox + width) > maxX) maxX = croppedTemplate.ox + width;
			if((croppedTemplate.oy + height) > maxY) maxY = croppedTemplate.oy + height;
		}

		layered.crop(minX, minY, maxX - minX, maxY - minY);

		return layered.getBufferAsync(Jimp.MIME_PNG);
	},
};