require('dotenv').config();

const WebSocket = require('ws');
const axios = require('axios');
const Jimp = require('jimp');

let info;
let board;

const failedPixels = [];

let ws;

module.exports = {
	async init() {
		ws = new WebSocket(process.env.PXLS_WEBSOCKET);
		ws.on('open', async function open() {
			console.log('WebSocket Connected.');

			try {
				info = await axios.get(`${process.env.PXLS_URL}info`, { responseType: 'json' });
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
					if(red === 0 && green === 0 && blue === 0 && alpha === 0) {
						if(index === 255) return;
						const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[index].value);
						board.bitmap.data[idx] = parseInt(color[1], 16);
						board.bitmap.data[idx + 1] = parseInt(color[2], 16);
						board.bitmap.data[idx + 2] = parseInt(color[3], 16);
						board.bitmap.data[idx + 3] = 255;
					}
				});
				for(let i = 0; i < failedPixels.length; i++) {
					const x = failedPixels[i].x;
					const y = failedPixels[i].y;

					const idx = (board.bitmap.width * y + x) << 2;

					const red = board.bitmap.data[idx + 0];
					const green = board.bitmap.data[idx + 1];
					const blue = board.bitmap.data[idx + 2];
					const alpha = board.bitmap.data[idx + 3];

					const index = failedPixels[i].color;
					if(red === 0 && green === 0 && blue === 0 && alpha === 0) {
						if(index === 255) return;
						const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[index].value);
						board.bitmap.data[idx] = parseInt(color[1], 16);
						board.bitmap.data[idx + 1] = parseInt(color[2], 16);
						board.bitmap.data[idx + 2] = parseInt(color[3], 16);
						board.bitmap.data[idx + 3] = 255;
					}
				}
				console.log('Board initialized!');
			} catch (error) {
				console.error(error);
			}
		});

		ws.on('close', function close() {
			console.log('WebSocket Disconnected.');
			module.exports.init();
		});

		ws.on('message', function incoming(data) {
			try {
				data = JSON.parse(data);
				if(data.type === 'pixel') {
					for(let i = 0; i < data.pixels.length; i++) {
						const x = data.pixels[i].x;
						const y = data.pixels[i].y;

						const idx = (board.bitmap.width * y + x) << 2;

						const index = data.pixels[i].color;
						// console.log(`Pixel Placed: x=${x}, y=${y}, color=${index}`);
						if(index === 255) return;
						const color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[index].value);
						board.bitmap.data[idx] = parseInt(color[1], 16);
						board.bitmap.data[idx + 1] = parseInt(color[2], 16);
						board.bitmap.data[idx + 2] = parseInt(color[3], 16);
						board.bitmap.data[idx + 3] = 255;
					}
				}
			} catch (error) {
				if(data.type === 'pixel') {
					for(let i = 0; i < data.pixels.length; i++) {
						failedPixels.push(data.pixels[i]);
					}
				} else {
					console.error(error);
				}
			}
		});
	},
	info() {
		return info.data;
	},
	board() {
		return board;
	},
};