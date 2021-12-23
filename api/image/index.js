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
}

module.exports = {
	Image: Image,
};