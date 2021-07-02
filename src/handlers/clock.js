const pxls = require('../pxls');
const alert = require('./alert');

const delay = 5;

module.exports = {
	init(client) {
		setInterval(function() {
			const currentdate = new Date();
			if(currentdate.getMinutes() % delay == 0 && currentdate.getSeconds() == 0) {
				module.exports.execute(client);
			}
		}, 1000);
	},
	async execute(client) {
		pxls.createBoard();

		alert.checkAdvanced(client, delay);
	},
	getDelay() {
		return delay;
	},
};