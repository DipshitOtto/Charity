require('dotenv').config();

const fs = require('fs');
const axios = require('axios');

const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	if(command.options) {
		commands.push({
			'name': command.name,
			'description': command.description,
			'options': command.options,
		});
		for (const alias of command.aliases) {
			commands.push({
				'name': alias,
				'description': command.description,
				'options': command.options,
			});
		}
	}
}

function addCommand(command, index) {
	if(command.options) {
		axios.post(`https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`, command, {
			headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` },
		}).then(function(response) {
			if(response.status === 200 || response.status === 201) {
				console.log(`Added command ${command.name}.`);
			} else {
				console.log(`Couldn't add command ${command.name}. Response code ${response.status}.`);
			}
			setTimeout(function() {
				if(index + 1 < commands.length) {
					addCommand(commands[index + 1], index + 1);
				}
			}, 5000);
		}).catch(function() {
			console.log(`Couldn't add command ${command.name}. Error.`);
		});
	} else if(index + 1 < commands.length) {
		addCommand(commands[index + 1], index + 1);
	}
}

addCommand(commands[0], 0);