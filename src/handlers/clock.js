const pxls = require('../pxls');
const alert = require('./alert');
const manage = require('../commands/manage');
const check = require('../commands/check');

const delay = 5;

module.exports = {
	init(client) {
		setInterval(function() {
			const currentdate = new Date();
			if (currentdate.getMinutes() % delay == 0 && currentdate.getSeconds() == 0) {
				module.exports.executeSlow(client);
			}
			module.exports.executeFast();
		}, 1000);
	},
	async executeSlow(client) {
		pxls.createBoard();

		alert.checkAdvanced(client, delay);
	},
	async executeFast() {
		alert.clearExpiredPixels(true);
		manage.clearExpiredInteractions();
		check.clearExpiredInteractions();
	},
	getDelay() {
		return delay;
	},
};