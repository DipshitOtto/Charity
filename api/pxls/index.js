const PxlsAPI = require('@blankparenthesis/pxlsspace').Pxls;
const { BufferType } = require('@blankparenthesis/pxlsspace');

const sharp = require('sharp');

class Pxls extends PxlsAPI {
	constructor(optionsOrSite) {
		super(optionsOrSite);
	}

	static async saveIndexedArrayColor(buffer, palette) {
		return await sharp(Buffer.from(buffer.data.deindex(palette)), {
			raw: {
				width: buffer.width,
				height: buffer.height,
				channels: 4,
			},
		})
			.png()
			.toBuffer();
	}

	async saveCanvas() {
		return await Pxls.saveIndexedArrayColor(this.canvas, this.palette);
	}
}

module.exports = {
	Pxls: Pxls,
	BufferType: BufferType,
};
