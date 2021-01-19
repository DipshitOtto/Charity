require('dotenv').config();

const pxls = require('../pxls');

const Jimp = require('jimp');

module.exports = {
	board() {
		const board = pxls.board();
		return board.getBufferAsync(Jimp.MIME_PNG);
	},
};