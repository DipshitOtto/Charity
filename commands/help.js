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
	execute(message, args) {
		fs.readFile('./assets/profile.png', function(err, buffer) {
			if (err) throw err;
			const data = [];
			const { commands } = message.client;

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Help:')
				.attachFiles([buffer])
				.setThumbnail('attachment://file.jpg');

			if (!args.length) {
				for(const command of commands) {
					if(command[1].usage && command[1].usage.trim() != '') {
						data.push(`• \`${process.env.BOT_PREFIX}${command[1].name} ${command[1].usage}\` - ${command[1].description}`);
					} else {
						data.push(`• \`${process.env.BOT_PREFIX}${command[1].name}\` - ${command[1].description}`);
					}
				}
				data.push(`\nYou can send \`${process.env.BOT_PREFIX}help [command name]\` to get info on a specific command!`);

				embed.setDescription(data.join('\n'));

				return message.channel.send(embed);
			}

			const name = args[0].toLowerCase();
			const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) {
				return message.channel.send(':x: That\'s not a valid command!');
			}

			data.push(`\`${process.env.BOT_PREFIX}${command.name}\``);

			if (command.aliases && command.aliases.length > 0) data.push(`**Aliases:** \`${process.env.BOT_PREFIX}${command.aliases.join(`\`, \`${process.env.BOT_PREFIX}`)}\``);
			if (command.description) data.push(`**Description:** ${command.description}`);
			if (command.usage) data.push(`**Usage:** \`${process.env.BOT_PREFIX}${command.name} ${command.usage}\``);

			data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

			embed.setDescription(data.join('\n'));

			message.channel.send(embed);
		});
	},
};