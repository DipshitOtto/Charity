const WebSocketClient = require('websocket').client;
const axios = require('axios');
const Jimp = require('jimp');

let info;
let board;

const failedPixels = [];

module.exports = {
	async init() {
		const ws = new WebSocketClient();

		ws.on('connectFailed', function(error) {
			console.log('Websocket Connecting Error: ' + error.toString());
			setTimeout(function() { module.exports.init(); }, 5000);
		});

		ws.on('connect', async function(connection) {
			console.log('Websocket Connected!');

			connection.on('error', function(error) {
				console.log('Websocket Error: ' + error.toString());
				setTimeout(function() { module.exports.init(); }, 5000);
			});

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
				console.log('Board Initialized!');
			} catch (error) {
				console.error(error);
			}

			connection.on('close', function() {
				console.log('Websocket Closed');
				setTimeout(function() { module.exports.init(); }, 5000);
			});
			connection.on('message', function(message) {
				if (message.type === 'utf8') {
					const data = JSON.parse(message.utf8Data);
					try {
						if(data.type === 'pixel') {
							for(let i = 0; i < data.pixels.length; i++) {
								const x = data.pixels[i].x;
								const y = data.pixels[i].y;

								const idx = (board.bitmap.width * y + x) << 2;

								const index = data.pixels[i].color;
								console.log(`Pixel Placed: x=${x}, y=${y}, color=${index}`);
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
				}
			});
		});

		ws.connect(process.env.PXLS_WEBSOCKET);
	},
	info() {
		return info.data;
	},
	board() {
		return board;
	},
	async users() {
		let users = await axios.get(`${process.env.PXLS_URL}users`, { responseType: 'json' });
		users = users.data.count;
		return users;
	},
	async cooldown(users) {
		const cooldown = 2.5 * Math.sqrt(users + 11.96) + 6.5;

		function format(cd) {
			const hours = Math.floor(cd / 3600);
			let minutes = Math.floor((cd - (hours * 3600)) / 60);
			let seconds = (cd - (hours * 3600) - (minutes * 60)).toFixed(2);

			if (minutes < 10) {minutes = '0' + minutes;}
			if (seconds < 10) {seconds = '0' + seconds;}
			return minutes + ':' + seconds;
		}

		const cooldowns = [
			[cooldown, format(cooldown.toFixed(2))],
			[cooldown * 6, format((cooldown * 6).toFixed(2))],
			[cooldown * 9, format((cooldown * 9).toFixed(2))],
			[cooldown * 15, format((cooldown * 15).toFixed(2))],
			[cooldown * 24, format((cooldown * 24).toFixed(2))],
			[cooldown * 36, format((cooldown * 36).toFixed(2))],
		];

		return cooldowns;
	},
};