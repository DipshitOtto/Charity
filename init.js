require('dotenv').config();

const fs = require('fs');
const axios = require('axios');

const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));

function addCommand(file, index) {
	const command = require(`./src/commands/${file}`);
	if(command.options) {
		const commandJSON = {
			'name': command.name,
			'description': command.description,
			'options': command.options,
		};
		axios.post(`https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`, commandJSON, {
			headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
		}).then(function(response) {
			if(response.status === 200) {
				console.log(`Added command ${command.name}.`);
			} else {
				console.log(`Couldn't add command ${command.name}. Response code ${response.status}`);
			}
			setTimeout(function() {
				if(index + 1 < commandFiles.length) {
					addCommand(commandFiles[index + 1], index + 1);
				}
			}, 5000);
		}).catch(function() {
			console.log(`Couldn't add command ${command.name}. Error.`);
		});
	} else if(index + 1 < commandFiles.length) {
		addCommand(commandFiles[index + 1], index + 1);
	}
}

addCommand(commandFiles[0], 0);