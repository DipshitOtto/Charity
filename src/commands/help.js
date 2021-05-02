require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'help',
	description: 'List all commands or get info about a specific command.',
	aliases: [],
	// aliases: ['commands'],
	guildOnly: false,
	permissions: '',
	cooldown: 1,
	options: [
		{
			'type': 3,
			'name': 'command',
			'description': 'The command to get info about.',
			'default': false,
			'required': false,
		},
	],
	execute(interaction, client) {
		const argument = (interaction.data.options) ? interaction.data.options.find(option => option.name == 'command').value : null;

		fs.readFile('./src/assets/profile.png', function(err, buffer) {
			if (err) throw err;
			const data = [];
			const { commands } = client;

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Help:')
				.setThumbnail('attachment://file.jpg');

			if (!argument) {
				for(const command of commands) {
					let usage = '';
					for (let i = 0; i < command[1].options.length; i++) {
						if(i < 2) {
							if(command[1].options[i].type === 1 || command[1].options[i].type === 2) {
								if(i === 0) {
									usage += ` {${command[1].options[i].name}`;
								} else if (i === command[1].options.length - 1) {
									usage += `|${command[1].options[i].name}}`;
								} else {
									usage += `|${command[1].options[i].name}`;
								}
							} else if(command[1].options[i].required) {
								usage += ` <${command[1].options[i].name}>`;
							} else {
								usage += ` [${command[1].options[i].name}]`;
							}
						} else {
							usage += '...';
							break;
						}
					}
					data.push(`• \`/${command[1].name}${usage}\` - ${command[1].description}`);
				}
				data.push('\nYou can send `/help [command]` to get info on a specific command!');

				embed.setDescription(data.join('\n'));
				embed.setFooter('<> is a required argument. [] is an optional argument. {} is a set of required items, you must choose one.');

				return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
					type: 4,
					data: {
						embeds: [embed.toJSON()],
						files: [{
							attachment: buffer,
							name: 'file.jpg',
						}],
					},
				} });
			}

			const name = argument.toLowerCase();
			const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) {
				const error = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(':x: That\'s not a valid command!');
				return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
					type: 4,
					data: {
						embeds: [error.toJSON()],
					},
				} });
			}

			data.push(`\`/${command.name}\``);

			if (command.aliases && command.aliases.length > 0) data.push(`**Aliases:** \`/${command.aliases.join('`, `/')}\``);
			if (command.description) data.push(`**Description:** ${command.description}`);

			if(command.options.length) {
				let usage = `**Usage:** \n\`/${command.name}`;
				for (let i = 0; i < command.options.length; i++) {
					if(command.options[i].type === 1) {
						(i === 0) ? usage += ` ${command.options[i].name}` : usage += `\`\n\`/${command.name} ${command.options[i].name}`;
						for (let j = 0; j < command.options[i].options.length; j++) {
							if(command.options[i].options[j].required) {
								usage += ` <${command.options[i].options[j].name}>`;
							} else {
								usage += ` [${command.options[i].options[j].name}]`;
							}
						}
					} else if(command.options[i].type === 2) {
						for (let j = 0; j < command.options[i].options.length; j++) {
							(j === 0) ? usage += ` ${command.options[i].name}` : usage += `\`\n\`/${command.name} ${command.options[i].name}`;
							usage += ` ${command.options[i].options[j].name}`;
							for (let k = 0; k < command.options[i].options[j].options.length; k++) {
								if(command.options[i].options[j].options[k].required) {
									usage += ` <${command.options[i].options[j].options[k].name}>`;
								} else {
									usage += ` [${command.options[i].options[j].options[k].name}]`;
								}
							}
						}
					} else if(command.options[i].required) {
						usage += ` <${command.options[i].name}>`;
					} else {
						usage += ` [${command.options[i].name}]`;
					}
				}
				usage += '`';
				data.push(usage);
			}

			data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

			embed.setDescription(data.join('\n'));

			client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
					files: [{
						attachment: buffer,
						name: 'file.jpg',
					}],
				},
			} });
		});
	},
};