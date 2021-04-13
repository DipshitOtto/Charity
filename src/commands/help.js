require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'help',
	description: 'List all commands or get info about a specific command.',
	aliases: ['commands'],
	args: false,
	usage: '[command name]',
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
				.attachFiles([buffer])
				.setThumbnail('attachment://file.jpg');

			if (!argument) {
				for(const command of commands) {
					if(command[1].usage && command[1].usage.trim() != '') {
						data.push(`• \`/${command[1].name} ${command[1].usage}\` - ${command[1].description}`);
					} else {
						data.push(`• \`/${command[1].name}\` - ${command[1].description}`);
					}
				}
				data.push('\nYou can send `/help [command]` to get info on a specific command!');

				embed.setDescription(data.join('\n'));

				return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
					type: 4,
					data: {
						embeds: [embed.toJSON()],
					},
				} });
			}

			const name = argument.toLowerCase();
			const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) {
				return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
					type: 4,
					data: ':x: That\'s not a valid command!',
				} });
			}

			data.push(`\`/${command.name}\``);

			if (command.aliases && command.aliases.length > 0) data.push(`**Aliases:** \`/${command.aliases.join('`, `/')}\``);
			if (command.description) data.push(`**Description:** ${command.description}`);
			if (command.usage) data.push(`**Usage:** \`/${command.name} ${command.usage}\``);

			data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

			embed.setDescription(data.join('\n'));

			client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
				},
			} });
		});
	},
};