require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('../handlers/database');

module.exports = {
	name: 'template',
	description: 'View/Add/Edit/Remove a template in the progress checker.',
	aliases: ['project', 'temp'],
	args: true,
	usage: '<view|add|edit|remove|list>',
	guildOnly: true,
	permissions: 'MANAGE_GUILD',
	cooldown: 3,
	async execute(message, args) {
		const command = args.shift().toLowerCase();

		if (command === 'view') {
			if (args.length < 1) {
				fs.readFile('./src/assets/profile.png', function(err, buffer) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle('Help:')
						.setDescription(`\`${process.env.BOT_PREFIX}template view\`\n**Description:** View template information in the progress checker.\n**Usage:** \`${process.env.BOT_PREFIX}template view <template name>\``)
						.attachFiles([buffer])
						.setThumbnail('attachment://file.jpg');

					return message.channel.send(embed);
				});
			} else {
				const template = await database.getTemplate(args[0], message.guild.id);
				if (template == null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${args[0]}\` does not exist!\nYou can create it with \`${process.env.BOT_PREFIX}template add ${args[0]} <template url>\`!`);

					return message.channel.send(embed);
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle(template.title)
						.setDescription('```cs\n' +
							`canvasCode: '${template.canvasCode}',\n` +
							`name: '${template.name}',\n` +
							`hidden: ${template.hidden.toString()},\n` +
							`title: '${template.title}',\n` +
							`image: '${template.image}',\n` +
							`ox: ${template.ox},\n` +
							`oy: ${template.oy},\n` +
							`width: ${template.width},\n` +
							`reference: '${template.reference}'\`\`\``);

					return message.channel.send(embed);
				}
			}
		} else if (command === 'add') {
			if (args.length < 2) {
				fs.readFile('./src/assets/profile.png', function(err, buffer) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle('Help:')
						.setDescription(`\`${process.env.BOT_PREFIX}template add\`\n**Description:** Add a template to the progress checker.\n**Usage:** \`${process.env.BOT_PREFIX}template add <template name> <template url>\``)
						.attachFiles([buffer])
						.setThumbnail('attachment://file.jpg');

					return message.channel.send(embed);
				});
			} else if (!!args[1].match(/[#&?]title=.*?(&|$)/g) && !!args[1].match(/[#&?]template=.*?(&|$)/g) && !!args[1].match(/[#&?]ox=.*?(&|$)/g) && !!args[1].match(/[#&?]oy=.*?(&|$)/g) && !!args[1].match(/[#&?]tw=.*?(&|$)/g)) {
				const data = {
					canvasCode: pxls.info().data.canvasCode,
					gid: message.guild.id,
					name: args[0],
					hidden: false,
					title: decodeURIComponent(args[1].match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
					image: decodeURIComponent(args[1].match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
					ox: parseInt(decodeURIComponent(args[1].match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
					oy: parseInt(decodeURIComponent(args[1].match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
					width: parseInt(decodeURIComponent(args[1].match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
					reference: args[1],
				};

				await database.addTemplate(args[0], message.guild.id, data);

				const template = await database.getTemplate(args[0], message.guild.id);

				if (template === null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Couldn't create template \`${args[0]}\`!`);

					return message.channel.send(embed);
				}
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(template.title)
					.setDescription('```cs\n' +
						`canvasCode: '${template.canvasCode}',\n` +
						`name: '${template.name}',\n` +
						`hidden: ${template.hidden.toString()},\n` +
						`title: '${template.title}',\n` +
						`image: '${template.image}',\n` +
						`ox: ${template.ox},\n` +
						`oy: ${template.oy},\n` +
						`width: ${template.width},\n` +
						`reference: '${template.reference}'\`\`\``);

				return message.channel.send(embed);
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: You must provide a valid template link!\nThe proper usage would be: \`${process.env.BOT_PREFIX}template add <template name> <template url>\``);

				return message.channel.send(embed);
			}
		} else if (command === 'edit') {
			if (args.length < 3) {
				fs.readFile('./src/assets/profile.png', function(err, buffer) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle('Help:')
						.setDescription(`\`${process.env.BOT_PREFIX}template edit\`\n**Description:** Edit template information in the progress checker.\n**Usage:** \`${process.env.BOT_PREFIX}template edit <template name> <key> <value>\``)
						.attachFiles([buffer])
						.setThumbnail('attachment://file.jpg');

					return message.channel.send(embed);
				});
			} else {
				const templateName = args.shift();
				const argument = args.shift();
				const value = args.join(' ');
				let data = null;
				if (argument === 'canvasCode') {
					data = {
						canvasCode: value,
					};
				} else if (argument === 'name') {
					data = {
						name: value,
					};
				} else if (argument === 'hidden') {
					if (value === 'true') {
						data = {
							hidden: true,
						};
					} else {
						data = {
							hidden: false,
						};
					}
				} else if (argument === 'title') {
					data = {
						title: value,
					};
				} else if (argument === 'image') {
					data = {
						image: value,
					};
				} else if (argument === 'ox') {
					data = {
						ox: parseInt(value),
					};
				} else if (argument === 'oy') {
					data = {
						oy: parseInt(value),
					};
				} else if (argument === 'width') {
					data = {
						width: parseInt(value),
					};
				} else if (argument === 'reference') {
					if (!!value.match(/[#&?]title=.*?(&|$)/g) && !!value.match(/[#&?]template=.*?(&|$)/g) && !!value.match(/[#&?]ox=.*?(&|$)/g) && !!value.match(/[#&?]oy=.*?(&|$)/g) && !!value.match(/[#&?]tw=.*?(&|$)/g)) {
						data = {
							title: decodeURIComponent(value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
							image: decodeURIComponent(value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
							ox: parseInt(decodeURIComponent(value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
							oy: parseInt(decodeURIComponent(value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
							width: parseInt(decodeURIComponent(value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
							reference: value,
						};
					} else {
						data = {
							reference: value,
						};
					}
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Argument \`${argument}\` does not exist!`);

					return message.channel.send(embed);
				}

				await database.editTemplate(templateName, message.guild.id, data);

				const template = await database.getTemplate(templateName, message.guild.id);

				if (template == null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${templateName}\` does not exist!\nYou can create it with \`${process.env.BOT_PREFIX}template add ${templateName} <template url>\`!`);

					return message.channel.send(embed);
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle(template.title)
						.setDescription('```cs\n' +
							`canvasCode: '${template.canvasCode}',\n` +
							`name: '${template.name}',\n` +
							`hidden: ${template.hidden.toString()},\n` +
							`title: '${template.title}',\n` +
							`image: '${template.image}',\n` +
							`ox: ${template.ox},\n` +
							`oy: ${template.oy},\n` +
							`width: ${template.width},\n` +
							`reference: '${template.reference}'\`\`\``);

					return message.channel.send(embed);
				}
			}
		} else if (command === 'remove') {
			if (args.length < 1) {
				fs.readFile('./src/assets/profile.png', function(err, buffer) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle('Help:')
						.setDescription(`\`${process.env.BOT_PREFIX}template remove\`\n**Description:** Remove template from the progress checker.\n**Usage:** \`${process.env.BOT_PREFIX}template remove <template name>\``)
						.attachFiles([buffer])
						.setThumbnail('attachment://file.jpg');

					return message.channel.send(embed);
				});
			} else {
				const result = await database.removeTemplate(args[0], message.guild.id);
				if (result.deletedCount > 0) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:white_check_mark: Deleted template \`${args[0]}\`!`);

					return message.channel.send(embed);
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${args[0]}\` does not exist!`);

					return message.channel.send(embed);
				}
			}
		} else if (command === 'list') {
			const templates = await database.listTemplates(message.guild.id);

			const results = [];

			await templates.forEach(result => {
				results.push(`\`${result.name}\` - ${result.title}`);
			});

			if (results.length === 0) results.push('There are no templates in this progress checker!');

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(results.join('\n'));

			return message.channel.send(embed);
		}
	},
};