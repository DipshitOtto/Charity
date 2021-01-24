const pxls = require('../pxls');

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
								const pixelColor = '0x' + (image.getPixelColor(px, py) >>> 0).toString(16).padStart(8, '0');
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
};