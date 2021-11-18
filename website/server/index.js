const path = require('path');
const express = require('express');


module.exports = {
	start() {
		const app = express();

		app.use(express.static(path.resolve(__dirname, '../client/build')));

		app.get('/info', (req, res) => {
			res.json({
				appID: process.env.APP_ID,
				invitePerms: process.env.INVITE_PERMS,
				discordURL: process.env.DISCORD_URL,
				patreonURL: process.env.PATREON_URL,
			});
		});

		app.get('*', (req, res) => {
			res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
		});

		app.listen(process.env.PORT, () => {
			console.log(`Server listening on ${process.env.PORT}`);
		});
	},
};