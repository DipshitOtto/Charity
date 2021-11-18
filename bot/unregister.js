require('dotenv').config();

const axios = require('axios');

function deleteCommand(command, commands, index) {
	axios.delete(`https://discord.com/api/v8/applications/${process.env.APP_ID}/commands/${command.id}`, {
		headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
	}).then(function(response) {
		if (response.status === 204) {
			console.log(`Deleted command ${command.name}.`);
		} else {
			console.log(`Couldn't delete command ${command.name}. Response code ${response.status}.`);
		}
		setTimeout(function() {
			if (index + 1 < commands.length) {
				deleteCommand(commands[index + 1], commands, index + 1);
			}
		}, 5000);
	}).catch(function() {
		console.log(`Couldn't add command ${command.name}. Error.`);
	});
}

axios.get(`https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`, {
	headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
}).then(function(response) {
	if (response.status === 200) {
		const commands = [];
		for (let i = 0; i < response.data.length; i++) {
			commands.push({ name: response.data[i].name, id: response.data[i].id });
		}
		deleteCommand(commands[0], commands, 0);
	}
}).catch(function(error) {
	console.log(error);
});