let Jimp = require('jimp');

const browser = Jimp.default ? true : false;
Jimp = browser ? Jimp.default : Jimp;

class Image {
	static mixColors(col1, col2) {
		let mix = [0, 0, 0];
		const col1p = Image.srgb2rgb(col1);
		const col2p = Image.srgb2rgb(col2);
		for (let i = 2; i >= 0; i -= 1) {
		  mix[i] = (col1p[i] + col2p[i]) / 2;
		}
		mix = Image.rgb2srgb(mix);
		mix[0] = Math.round(mix[0] * 1000) / 1000;
		mix[1] = Math.round(mix[1] * 1000) / 1000;
		mix[2] = Math.round(mix[2] * 1000) / 1000;

		return mix;
	}

	static rgb2srgb(col) {
		const rp = col[0] / 255;
		const gp = col[1] / 255;
		const bp = col[2] / 255;
		const r = (rp < 0.0031308 ? rp * 12.92 : 1.055 * Math.pow(rp, 1 / 2.4) - 0.055) * 255;
		const g = (gp < 0.0031308 ? gp * 12.92 : 1.055 * Math.pow(gp, 1 / 2.4) - 0.055) * 255;
		const b = (bp < 0.0031308 ? bp * 12.92 : 1.055 * Math.pow(bp, 1 / 2.4) - 0.055) * 255;

		return [r, g, b];
	}

	static srgb2rgb(col) {
		const r = col[0] / 255;
		const g = col[1] / 255;
		const b = col[2] / 255;

		const rp = (r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92) * 255;
		const gp = (g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92) * 255;
		const bp = (b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92) * 255;

		return [rp, gp, bp];
	}

	static lwrgbde(col1, col2) {
		const r1 = col1[0];
		const r2 = col2[0];
		const dr = (r1 - r2) / 255;
		const g1 = col1[1];
		const g2 = col2[1];
		const dg = (g1 - g2) / 255;
		const b1 = col1[2];
		const b2 = col2[2];
		const db = (b1 - b2) / 255;
		const l1 = (r1 * 0.299 + g1 * 0.587 + b1 * 0.114) / 255.0;
		const l2 = (r2 * 0.299 + g2 * 0.587 + b2 * 0.114) / 255.0;
		const dl = l1 - l2;

		return (dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114) * 0.75 + dl * dl;
	}

	static rgb2xyz(col) {
		const r = col[0] / 255;
		const g = col[1] / 255;
		const b = col[2] / 255;

		const x = r * 41.2453 + g * 35.7580 + b * 18.0423;
		const y = r * 21.2671 + g * 71.5160 + b * 7.2169;
		const z = r * 1.9334 + g * 11.9193 + b * 95.0227;

		return [x, y, z];
	}

	static xyz2lab(xyz) {
		let x = xyz[0] / 95.047;
		let y = xyz[1] / 100.000;
		let z = xyz[2] / 108.883;

		x = x > 0.008856451586 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
		y = y > 0.008856451586 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
		z = z > 0.008856451586 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

		const l = 116 * y - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	}

	static rgb2lab(col) {
		const rgb = Image.srgb2rgb(col);
		const xyz = Image.rgb2xyz(rgb);
		const lab = Image.xyz2lab(xyz);

		return lab;
	}

	static mciede2000lab(Lab1, Lab2) {
		const rad = 180 / Math.PI;
		const L1 = Lab1[0];
		const a1 = Lab1[1];
		const b1 = Lab1[2];
		const L2 = Lab2[0];
		const a2 = Lab2[1];
		const b2 = Lab2[2];
		const dL = L2 - L1;
		const C1 = Math.sqrt(a1 * a1 + b1 * b1);
		const C2 = Math.sqrt(a2 * a2 + b2 * b2);
		const Cavg = (C1 + C2) / 2.0;
		const G = 0.5 * (1 - Math.sqrt(Math.pow(Cavg, 7) / (Math.pow(Cavg, 7) + 6103515625))) + 1;
		const a1p = G * a1;
		const a2p = G * a2;
		const C1p = Math.sqrt(a1p * a1p + b1 * b1);
		const C2p = Math.sqrt(a2p * a2p + b2 * b2);
		const dCp = C2p - C1p;
		const Cpavg = (C1p + C2p) / 2.0;
		let h1p = -1;
		if (a1p === 0 && b1 === 0) {
			h1p = 0;
		} else if (b1 >= 0) {
			h1p = Math.atan2(b1, a1p) * rad;
		} else {
			h1p = Math.atan2(b1, a1p) * rad + 360;
		}
		let h2p = -1;
		if (a2p === 0 && b2 === 0) {
			h2p = 0;
		} else if (b2 >= 0) {
			h2p = Math.atan2(b2, a2p) * rad;
		} else {
			h2p = Math.atan2(b2, a2p) * rad + 360;
		}
		let dhp = h2p - h1p;
		if (dhp > 180) {
			dhp -= 360;
		} else if (dhp < -180) {
			dhp += 360;
		}
		let hpavg = -1;
		if (C1p * C2p === 0) {
			hpavg = h1p + h2p;
		} else if (Math.abs(h2p - h1p) <= 180) {
			hpavg = (h1p + h2p) / 2;
		} else if (h2p + h1p < 360) {
			hpavg = (h1p + h2p + 360) / 2;
		} else {
			hpavg = (h1p + h2p - 360) / 2;
		}
		const SC = 1 + 0.045 * Cpavg;
		const q = dCp / SC;
		const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / rad / 2);
		const T = 1 - 0.17 * Math.cos((hpavg - 30) / rad) + 0.24 * Math.cos(2 * hpavg / rad) + 0.32 * Math.cos((3 * hpavg + 6) / rad) - 0.2 * Math.cos((4 * hpavg - 63) / rad);
		const SH = 1 + 0.015 * Cpavg * T;
		const r = dHp / SH;
		const dTheta = 30 * Math.exp(-1 * ((hpavg - 275) / 25.0) * ((hpavg - 275) / 25.0));
		const RpC = 2 * Math.sqrt(Math.pow(Cpavg, 7) / (Math.pow(Cpavg, 7) + 6103515625));
		const RpT = -Math.sin(2 * dTheta / rad) * RpC;
		const deltaE = Math.sqrt(dL * dL + q * q + r * r + RpT * q * r);
		return deltaE;
	}

	static mciede2000mix(col1rgb, col2lab) {
		return Image.mciede2000lab(Image.rgb2lab(col1rgb), col2lab);
	}

	static mciede2000(col1, col2) {
		return Image.mciede2000lab(Image.rgb2lab(col1), Image.rgb2lab(col2));
	}

	static mapcolor(col, map, deFunction) {
		let bestMatch = -1;
		let bestMatchDE = 1e6;
		const mapLength = map.length;
		for (let i = 0; i < mapLength; i += 1) {
		  const de = deFunction(col, map[i]);
		  if (de < bestMatchDE) {
				bestMatchDE = de;
				bestMatch = i;
		  }
		}

		return bestMatch;
	}

	static async process(buffer, palette, formula, dithering = false, ditherThreshold = 20) {
		let generated;

		const mapLUT = [];
		const deFunction = formula === 'fast' ? Image.lwrgbde : Image.mciede2000mix;

		const threshold = ditherThreshold * 1.2;
		const colorValuesRGB = [];
		for (let i = 0; i < palette.length; i++) {
			colorValuesRGB.push(palette[i].values);
		}
		const colorValuesLab = colorValuesRGB.map((val) => Image.rgb2lab(val));
		const colorValuesExRGB = [];
		const colorValuesExLab = [];
		colorValuesRGB.forEach((col1, col1idx) => {
			colorValuesRGB.forEach((col2, col2idx) => {
				if (col2idx >= col1idx) {
					if (Image.mciede2000(col1, col2) <= threshold) {
						const mix = Image.mixColors(col1, col2);
						const col1lab = colorValuesLab[col1idx];
						const col2lab = colorValuesLab[col2idx];
						if (col1lab[0] >= col2lab[0]) {
							colorValuesExRGB.push([mix[0], mix[1], mix[2], col1idx, col2idx]);
						} else {
							colorValuesExRGB.push([mix[0], mix[1], mix[2], col2idx, col1idx]);
						}
					}
				}
			});
		});
		colorValuesExRGB.forEach((val, idx) => {
			colorValuesExLab[idx] = Image.rgb2lab(val);
			colorValuesExLab[idx][3] = val[3];
			colorValuesExLab[idx][4] = val[4];
		});

		if (dithering) {
			palette = formula === 'fast' ? colorValuesExRGB : colorValuesExLab;
			await Jimp.read(buffer).then(async (image) => {
				const destPixels = image.bitmap.data;
				const destPixelsLength = destPixels.length;
				const rowSize = image.bitmap.width * 4;
				for (let i = destPixelsLength - 1; i >= 0; i -= 4) {
					if (destPixels[i] === 255) {
						const pixelColor = [
							destPixels[i - 3],
							destPixels[i - 2],
							destPixels[i - 1],
						];
						const pixelColorBitEnc = (pixelColor[0] << 16) + (pixelColor[1] << 8) + pixelColor[2];
						let matchIndex = -1;
						const lutResult = mapLUT[pixelColorBitEnc];
						if (lutResult >= 0) {
							matchIndex = lutResult;
						} else {
							matchIndex = Image.mapcolor(pixelColor, palette, deFunction);
							mapLUT[pixelColorBitEnc] = matchIndex;
						}
						const col1index = colorValuesExRGB[matchIndex][3];
						const col2index = colorValuesExRGB[matchIndex][4];
						if ((((i - 3) % rowSize) / 4 + Math.floor(i / rowSize)) % 2 === 0) {
							matchIndex = col1index;
						} else {
							matchIndex = col2index;
						}

						const matchingColor = colorValuesRGB[matchIndex];

						destPixels[i - 3] = matchingColor[0];
						destPixels[i - 2] = matchingColor[1];
						destPixels[i - 1] = matchingColor[2];
					}
				}
				generated = image.getBufferAsync(Jimp.MIME_PNG);
			});
		} else {
			palette = formula === 'fast' ? colorValuesRGB : colorValuesLab;
			await Jimp.read(buffer).then(async (image) => {
				const destPixels = image.bitmap.data;
				const destPixelsLength = destPixels.length;
				for (let i = destPixelsLength - 1; i >= 0; i -= 4) {
					destPixels[i] >= 128 ? destPixels[i] = 255 : destPixels[i] = 0;
					if (destPixels[i] === 255) {
						const pixelColor = [
							destPixels[i - 3],
							destPixels[i - 2],
							destPixels[i - 1],
						];
						const pixelColorBitEnc = (pixelColor[0] << 16) + (pixelColor[1] << 8) + pixelColor[2];
						let matchIndex = -1;
						const lutResult = mapLUT[pixelColorBitEnc];
						if (lutResult >= 0) {
							matchIndex = lutResult;
						} else {
							matchIndex = Image.mapcolor(pixelColor, palette, deFunction);
							mapLUT[pixelColorBitEnc] = matchIndex;
						}
						const matchingColor = colorValuesRGB[matchIndex];

						destPixels[i - 3] = matchingColor[0];
						destPixels[i - 2] = matchingColor[1];
						destPixels[i - 1] = matchingColor[2];
					}
				}
				generated = image.getBufferAsync(Jimp.MIME_PNG);
			});
		}

		return generated;
	}

	static async templatize(buffer, palette, style, glow) {
		if (style === 'dotted-small') {
			style = await Jimp.read(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABtElEQVR4AdXBMQHDMAAEsYv5c1aT4ZcysPRUutjphQYNGjRo0KBBgwYNGjRo0KBBn6fSxU6XO73QoEGDBg0aNGjQoEGDBg0aNOjzVLrY6XKnFxo0aNCgQYMGDRo0aNCgQYMGfZ5KFztd7vRCgwYNGjRo0KBBgwYNGjRo0KDPU+lip8udXmjQoEGDBg0aNGjQoEGDBg0a9HkqXex0udMLDRo0aNCgQYMGDRo0aNCgQYM+T6WLnS53eqFBgwYNGjRo0KBBgwYNGjRo0OepdLHT5U4vNGjQoEGDBg0aNGjQoEGDBg36PJUudrrc6YUGDRo0aNCgQYMGDRo0aNCgQZ+n0sVOlzu90KBBgwYNGjRo0KBBgwYNGjTo81S62OlypxcaNGjQoEGDBg0aNGjQoEGDBn2eShc7Xe70QoMGDRo0aNCgQYMGDRo0aNCgz1PpYqfLnV5o0KBBgwYNGjRo0KBBgwYNGvR5Kl3sdLnTCw0aNGjQoEGDBg0aNGjQoEGDPk+li50ud3qhQYMGDRo0aNCgQYMGDRo0aNDnqXSx0+VOLzRo0KBBgwYNGjRo0KBBgwb9eypd7AcVVAtvNOk3fAAAAABJRU5ErkJggg==', 'base64'));
		} else if (style === 'dotted-big') {
			style = await Jimp.read(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACd0lEQVR4AeXBMQHDMAAEsYv5c1aT4bcysPRUutjphdAgNAgNQoPQIDQIDUKD0CA0CA1Cg9AgNAgNQp/T5Z5KFztd7vRCaBAahAahQWgQGoQGoUFoEBqEBqFBaBAahAahz+lyT6WLnS53eiE0CA1Cg9AgNAgNQoPQIDQIDUKD0CA0CA1Cg9DndLmn0sVOlzu9EBqEBqFBaBAahAahQWgQGoQGoUFoEBqEBqFB6HO63FPpYqfLnV4IDUKD0CA0CA1Cg9AgNAgNQoPQIDQIDUKD0CD0OV3uqXSx0+VOL4QGoUFoEBqEBqFBaBAahAahQWgQGoQGoUFoEPqcLvdUutjpcqcXQoPQIDQIDUKD0CA0CA1Cg9AgNAgNQoPQIDQIfU6Xeypd7HS50wuhQWgQGoQGoUFoEBqEBqFBaBAahAahQWgQGoQ+p8s9lS52utzphdAgNAgNQoPQIDQIDUKD0CA0CA1Cg9AgNAgNQp/T5Z5KFztd7vRCaBAahAahQWgQGoQGoUFoEBqEBqFBaBAahAahz+lyT6WLnS53eiE0CA1Cg9AgNAgNQoPQIDQIDUKD0CA0CA1Cg9DndLmn0sVOlzu9EBqEBqFBaBAahAahQWgQGoQGoUFoEBqEBqFB6HO63FPpYqfLnV4IDUKD0CA0CA1Cg9AgNAgNQoPQIDQIDUKD0CD0OV3uqXSx0+VOL4QGoUFoEBqEBqFBaBAahAahQWgQGoQGoUFoEPqcLvdUutjpcqcXQoPQIDQIDUKD0CA0CA1Cg9AgNAgNQoPQIDQIfU6Xeypd7HS50wuhQWgQGoQGoUFoEBqEBqFBaBAahAahQWgQ+ud0uafSxX6rVwW/wCVjSQAAAABJRU5ErkJggg==', 'base64'));
		} else if (style === 'symbols') {
			style = await Jimp.read(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAYAAADG4PRLAAADZ0lEQVR4Ae3BAYplxxEAwcxC979yWg374PGZsWYt2aagIwTiWmv4U0VFRcVbRUVFRcVbxVHxVlFxVLxVfKfiqDgqHhUVFRVvFRUVFRW/q6LiUVFRUVHxVlFR8VZxVBwVj4qj4qj4VPGViqPiMfyioqJS8aaiovJWcVQcFW8qFSoV/wQVFZVPKioqX6n4ToWKykPlUDlUHhVvFQ+ViqNC5aFScVSovFUcFW8VbxXHH/xS8VD5CZX/h4qHyqPiOxVHhcpbxVGh8qhQOVQqVP5KxVuFyt+hclSoPP7gF5VHhcpPVDxU/hdUjoo3la9UvFWoHBVvFSqHSoVKhcpPqFQ8VN5UKlR+quJQqThUhl8qKipU3ioqKj6pHCq/o6Ki4k2lQqVC5a2iouK/reKoOCoeKm8qjwqVQ6Xip1QOlTeVN5VDIK61hmu14aWi4lNFRcVXKio+VVQcFZ8qKr5S8U+r+FRxVBwVj4qj4qh4q6j4TkXFp4qj4lNFxXcq3oZfKg6Vt4q3ik8qR8WjQkWl4lPFoVLxVqHyd1S8VRwVnypUKj5VHBVvFf9OxVcqjoqj4lHxqPhUcVQ8hheVip+qOCpUvlJxqDwqDpVD5VHxnYr/lMqh8qaiUqGi8rsqKv4ulbeKR8VbxTH8ovIVFZVDReWt4qHyVqGi8pWK71R8peKvVHyqOCo+VahU/JSKyu9SeVN5VLyp/BWB/sQnlbcKlbeKTypHxSeVo+KTylHxSeWo+KRyVHxSOSo+qRwVKo8KlUfFQ+VTxaHyqeJQ+VSh8qniUPlU8VA5BOJaa7hWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67Vhmu14VptuFYbrtWGa7XhWm24Vhuu1YZrteFabbhWG67V/gXxb2TwkFf77wAAAABJRU5ErkJggg==', 'base64'));
		} else if (style === 'numbers') {
			style = await Jimp.read(Buffer.from('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3qo4q7hSsar4TcWq4k7FVDFUqJxVrCoGlbOKqeI3FW9VTBW/qVhV3Kl4q2JVcadiqvi3/PCHykrljspK5Y7KSuWOykrljspK5Y7KSuWOykrljspK5Y7KFZUzlZXKHZWVyh2VlcodlZXKHZWVyr/F/sK2/cNU/gkCsW0fdbBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR92sG0fdrBtH3awbR/2fwDX34zIT4eQQwAAAABJRU5ErkJggg==', 'base64'));
		}

		const styleWidth = style.bitmap.width / 16;

		for (let i = 0; i < palette.length; i++) {
			const x = i % 16;
			const y = Math.floor(i / 16);
			const symbol = await Jimp.read(style);
			await symbol.crop(x * styleWidth, y * styleWidth, styleWidth, styleWidth);
			palette[i].style = symbol;
		}

		const upload = await Jimp.read(buffer);
		const templatized = upload.clone();
		templatized.resize(upload.bitmap.width * styleWidth, upload.bitmap.height * styleWidth, Jimp.RESIZE_NEAREST_NEIGHBOR);
		upload.scan(0, 0, upload.bitmap.width, upload.bitmap.height, function(x, y, idx) {
			const r = this.bitmap.data[idx + 0];
			const g = this.bitmap.data[idx + 1];
			const b = this.bitmap.data[idx + 2];
			const a = this.bitmap.data[idx + 3];
			a >= 128 ? this.bitmap.data[idx + 3] = 255 : this.bitmap.data[idx + 3] = 0;
			for (let i = 0; i < palette.length; i++) {
				if (r === palette[i].values[0] && g === palette[i].values[1] && b === palette[i].values[2]) {
					templatized.mask(palette[i].style, x * styleWidth, y * styleWidth);
				}
			}
		});

		if (glow) {
			templatized.scan(0, 0, templatized.bitmap.width, templatized.bitmap.height, function(scanX, scanY, scanIDX) {
				this.bitmap.data[scanIDX + 3] === 0 ? this.bitmap.data[scanIDX + 3] = 51 : this.bitmap.data[scanIDX + 3] = 255;
			});
		}
		return {
			image: await templatized.getBufferAsync(Jimp.MIME_PNG),
			scale: styleWidth,
		};
	}
}

module.exports = {
	Image: Image,
};