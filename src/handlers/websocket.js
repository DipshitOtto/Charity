const pxls = require('../pxls');
const alert = require('./alert');

const WebSocketClient = require('websocket').client;
const ws = new WebSocketClient();

module.exports = {
	connect() {
		ws.on('connectFailed', function(error) {
			console.log('Websocket Connecting Error: ' + error.toString());
			setTimeout(function() { this.connect(); }, 5000);
		});
		ws.on('connect', async function(connection) {
			console.log('Websocket Connected!');

			connection.on('error', function(error) {
				console.log('Websocket Error: ' + error.toString());
				setTimeout(function() { module.exports.connect(); }, 5000);
			});

			await pxls.init();

			connection.on('close', function() {
				console.log('Websocket Closed');
				setTimeout(function() { module.exports.connect(); }, 5000);
			});
			connection.on('message', function(message) {
				if (message.type === 'utf8') {
					const data = JSON.parse(message.utf8Data);
					try {
						if(data.type === 'pixel') {
							pxls.updateBoard(data);
							alert.checkPixel(data);
						}
					} catch (error) {
						if(data.type === 'pixel') {
							pxls.updateFailedBoardPixels(data);
						} else {
							console.error(error);
						}
					}
				}
			});
		});
		ws.connect(process.env.PXLS_WEBSOCKET);
	},
};