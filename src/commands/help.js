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
			name: 'command',
			type: 'STRING',
			description: 'The command to get info about.',
			required: false,
		},
	],
	execute(interaction, client) {
		const argument = interaction.options.get('command');

		fs.readFile('./src/assets/profile.png', async function(err, buffer) {
			if (err) throw err;
			const data = [];
			const { commands } = client;

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setURL(process.env.DISCORD_URL)
						.setLabel('Join the Discord!')
						.setStyle('LINK'),
				);

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Help:')
				.setThumbnail('attachment://profile.png');

			if (!argument) {
				for(const command of commands) {
					let usage = '';
					for (let i = 0; i < command[1].options.length; i++) {
						if(i < 2) {
							if(command[1].options[i].type === 'SUB_COMMAND' || command[1].options[i].type === 'SUB_COMMAND_GROUP') {
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

				return await interaction.reply({
					embeds: [embed],
					files: [{
						attachment: buffer,
						name: 'profile.png',
					}],
					components: [row],
				});
			}

			const command = commands.get(argument.value) || commands.find(c => c.aliases && c.aliases.includes(argument.value));

			if (!command) {
				const error = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(':x: That\'s not a valid command!');
				return await interaction.reply({ embeds: [error] });
			}

			data.push(`\`/${command.name}\``);

			if (command.aliases && command.aliases.length > 0) data.push(`**Aliases:** \`/${command.aliases.join('`, `/')}\``);
			if (command.description) data.push(`**Description:** ${command.description}`);

			if(command.options.length) {
				let usage = `**Usage:** \n\`/${command.name}`;
				for (let i = 0; i < command.options.length; i++) {
					if(command.options[i].type === 'SUB_COMMAND') {
						(i === 0) ? usage += ` ${command.options[i].name}` : usage += `\`\n\`/${command.name} ${command.options[i].name}`;
						for (let j = 0; j < command.options[i].options.length; j++) {
							if(command.options[i].options[j].required) {
								usage += ` <${command.options[i].options[j].name}>`;
							} else {
								usage += ` [${command.options[i].options[j].name}]`;
							}
						}
					} else if(command.options[i].type === 'SUB_COMMAND_GROUP') {
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

			await interaction.reply({
				embeds: [embed],
				files: [{
					attachment: buffer,
					name: 'profile.png',
				}],
			});
		});
	},
};