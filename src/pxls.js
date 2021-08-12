const axios = require('axios');
const Jimp = require('jimp');
const database = require('./handlers/database');

let info;
let board;
const boardPalette = [];

let failedPixels = [];

module.exports = {
	async init() {
		try {
			info = await axios.get(`${process.env.PXLS_URL}info`, { responseType: 'json' });

			module.exports.createBoard();
			database.purgeTemplates(info.data.canvasCode);
		} catch (error) {
			console.error(error);
		}
	},
	async createBoard() {
		const boardData = await axios.get(`${process.env.PXLS_URL}boarddata`, { responseType: 'arraybuffer' });

		board = new Jimp(info.data.width, info.data.height, 0x00000000, err => {
			if (err) throw err;
		});

		board.scan(0, 0, board.bitmap.width, board.bitmap.height, function(x, y, idx) {
			const red = this.bitmap.data[idx + 0];
			const green = this.bitmap.data[idx + 1];
			const blue = this.bitmap.data[idx + 2];
			const alpha = this.bitmap.data[idx + 3];

			const index = boardData.data[board.bitmap.width * y + x];
			boardPalette.push(index);
			if (red === 0 && green === 0 && blue === 0 && alpha === 0) {
				if (index === 255) return;
				const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[index].value);
				board.bitmap.data[idx] = parseInt(color[1], 16);
				board.bitmap.data[idx + 1] = parseInt(color[2], 16);
				board.bitmap.data[idx + 2] = parseInt(color[3], 16);
				board.bitmap.data[idx + 3] = 255;
			}
		});
		for (let i = 0; i < failedPixels.length; i++) {
			const x = failedPixels[i].x;
			const y = failedPixels[i].y;

			const idx = (board.bitmap.width * y + x) << 2;

			const index = failedPixels[i].color;
			boardPalette[board.bitmap.width * y + x] = index;
			if (index === 255) return;
			const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[index].value);
			board.bitmap.data[idx] = parseInt(color[1], 16);
			board.bitmap.data[idx + 1] = parseInt(color[2], 16);
			board.bitmap.data[idx + 2] = parseInt(color[3], 16);
			board.bitmap.data[idx + 3] = 255;
		}
		failedPixels = [];
		console.log('Board Initialized!');
	},
	updateBoard(data) {
		for (let i = 0; i < data.pixels.length; i++) {
			const x = data.pixels[i].x;
			const y = data.pixels[i].y;

			const idx = (board.bitmap.width * y + x) << 2;

			const index = data.pixels[i].color;
			boardPalette[board.bitmap.width * y + x] = index;
			if (index === 255) return;
			const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[index].value);
			board.bitmap.data[idx] = parseInt(color[1], 16);
			board.bitmap.data[idx + 1] = parseInt(color[2], 16);
			board.bitmap.data[idx + 2] = parseInt(color[3], 16);
			board.bitmap.data[idx + 3] = 255;
		}
	},
	updateFailedBoardPixels(data) {
		for (let i = 0; i < data.pixels.length; i++) {
			failedPixels.push(data.pixels[i]);
		}
	},
	info() {
		return info.data;
	},
	board() {
		return board;
	},
	boardPalette() {
		return boardPalette;
	},
	async users() {
		let users = await axios.get(`${process.env.PXLS_URL}users`, { responseType: 'json' });
		users = users.data.count;
		return users;
	},
	cooldown(users) {
		const cooldown = 2.5 * Math.sqrt(users + 11.96) + 6.5;

		return cooldown;
	},
	cooldownMultiplier(cooldown, stack) {
		function sum_up_to_n(n) {
			let r = 0;
			for (let i = 0; i < n; i++) {
				r += i;
			}
			return r;
		}

		if (stack === 0) return cooldown;
		return (cooldown * 3) * (1 + stack + sum_up_to_n(stack - 1));
	},
};