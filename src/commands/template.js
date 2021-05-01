const Discord = require('discord.js');
const axios = require('axios');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'template',
	description: 'View/Add/Edit/Remove a template in the progress checker.',
	// aliases: ['project', 'temp'],
	guildOnly: true,
	permissions: '',
	cooldown: 3,
	options: [
		{
			'type': 1,
			'name': 'view',
			'description': 'View a template in the progress checker.',
			'options': [
				{
					'type': 3,
					'name': 'name',
					'description': 'The name of the template you want to view in the progress checker.',
					'default': false,
					'required': true,
				},
			],
		},
		{
			'type': 1,
			'name': 'add',
			'description': 'Add a template to the progress checker.',
			'options': [
				{
					'type': 3,
					'name': 'name',
					'description': 'The name of the template you want to add to the progress checker.',
					'default': false,
					'required': true,
				},
				{
					'type': 3,
					'name': 'link',
					'description': 'The template link of the template you want to add to the progress checker.',
					'default': false,
					'required': true,
				},
			],
		},
		{
			'type': 1,
			'name': 'edit',
			'description': 'Edit a template in the progress checker.',
			'options': [
				{
					'type': 3,
					'name': 'name',
					'description': 'The name of the template you want to edit in the progress checker.',
					'default': false,
					'required': true,
				},
				{
					'type': 3,
					'name': 'key',
					'description': 'The attribute of the template you want to edit.',
					'default': false,
					'required': true,
				},
				{
					'type': 3,
					'name': 'value',
					'description': 'The value of the attribute you want to edit.',
					'default': false,
					'required': true,
				},
			],
		},
		{
			'type': 1,
			'name': 'remove',
			'description': 'Remove a template from the progress checker.',
			'options': [
				{
					'type': 3,
					'name': 'name',
					'description': 'The name of the template you want to remove from the progress checker.',
					'default': false,
					'required': true,
				},
			],
		},
		{
			'type': 1,
			'name': 'list',
			'description': 'List the templates in the progress checker.',
			'options': [],
		},
	],
	async execute(interaction, client) {
		const userID = (interaction.member.user.id) ? interaction.member.user.id : interaction.user.id;
		const permissions = parseInt(interaction.member.permissions);

		if (userID === process.env.BOT_OWNER || (permissions & 0x20) == 0x20) {
			const command = interaction.data.options[0].name;
			const args = interaction.data.options[0].options;

			if (command === 'view') {
				const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
				client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

				const name = (args.find(option => option.name == 'name')) ? args.find(option => option.name == 'name').value : null;

				const template = await database.getTemplate(name, interaction.guild_id);
				if (template == null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${name}\` does not exist!\nYou can create it with \`/template add ${name} <template url>\`!`);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
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
								`height: ${template.height},\n` +
								`scaleFactor: ${template.scaleFactor},\n` +
								`reference: '${template.reference}'\`\`\``);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				}
			} else if (command === 'add') {
				const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
				client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

				const name = (args.find(option => option.name == 'name')) ? args.find(option => option.name == 'name').value : null;
				const link = (args.find(option => option.name == 'link')) ? args.find(option => option.name == 'link').value : null;

				if (name === 'list') {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(':x: Can\'t use list as a template name!');

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				} else if (!!link.match(/[#&?]title=.*?(&|$)/g) && !!link.match(/[#&?]template=.*?(&|$)/g) && !!link.match(/[#&?]ox=.*?(&|$)/g) && !!link.match(/[#&?]oy=.*?(&|$)/g) && !!link.match(/[#&?]tw=.*?(&|$)/g)) {
					const data = {
						canvasCode: pxls.info().canvasCode,
						gid: interaction.guild_id,
						name: name,
						hidden: false,
						title: decodeURIComponent(link.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
						image: decodeURIComponent(link.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
						ox: parseInt(decodeURIComponent(link.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
						oy: parseInt(decodeURIComponent(link.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
						width: parseInt(decodeURIComponent(link.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
						reference: link,
					};

					const image = await axios.get(data.image, { responseType: 'arraybuffer' });

					data.scaleFactor = await canvas.scaleFactor(image.data, data.width);
					data.height = await canvas.height(image.data, data.scaleFactor);
					data.source = await canvas.templateSource(await canvas.detemplatize(image.data, data.width, data.height, data.scaleFactor), pxls.info().palette);

					await database.addTemplate(name, interaction.guild_id, data);

					const template = await database.getTemplate(name, interaction.guild_id);

					if (template === null) {
						const embed = new Discord.MessageEmbed()
							.setColor(process.env.BOT_COLOR)
							.setDescription(`:x: Couldn't create template \`${name}\`!`);

						return webhook.editMessage('@original', {
							embeds: [embed.toJSON()],
						});
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
							`height: ${template.height},\n` +
							`scaleFactor: ${template.scaleFactor},\n` +
							`reference: '${template.reference}'\`\`\``);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(':x: You must provide a valid template link!\nThe proper usage would be: `/template add <template name> <template url>`');

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				}
			} else if (command === 'edit') {
				const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
				client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

				const name = (args.find(option => option.name == 'name')) ? args.find(option => option.name == 'name').value : null;
				const key = (args.find(option => option.name == 'key')) ? args.find(option => option.name == 'key').value : null;
				const value = (args.find(option => option.name == 'value')) ? args.find(option => option.name == 'value').value : null;

				let data = null;
				if (key === 'canvasCode') {
					data = {
						canvasCode: value,
					};
				} else if (key === 'name') {
					data = {
						name: value.trim().split(/ +/).shift(),
					};
				} else if (key === 'hidden') {
					if (value === 'true') {
						data = {
							hidden: true,
						};
					} else {
						data = {
							hidden: false,
						};
					}
				} else if (key === 'title') {
					data = {
						title: value,
					};
				} else if (key === 'image') {
					data = {
						image: value,
					};
				} else if (key === 'ox') {
					data = {
						ox: parseInt(value),
					};
				} else if (key === 'oy') {
					data = {
						oy: parseInt(value),
					};
				} else if (key === 'width') {
					data = {
						width: parseInt(value),
					};
				} else if (key === 'height') {
					data = {
						width: parseInt(value),
					};
				} else if (key === 'scaleFactor') {
					data = {
						width: parseInt(value),
					};
				} else if (key === 'reference') {
					if (!!value.match(/[#&?]title=.*?(&|$)/g) && !!value.match(/[#&?]template=.*?(&|$)/g) && !!value.match(/[#&?]ox=.*?(&|$)/g) && !!value.match(/[#&?]oy=.*?(&|$)/g) && !!value.match(/[#&?]tw=.*?(&|$)/g)) {
						data = {
							title: decodeURIComponent(value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
							image: decodeURIComponent(value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
							ox: parseInt(decodeURIComponent(value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
							oy: parseInt(decodeURIComponent(value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
							width: parseInt(decodeURIComponent(value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
							reference: value,
						};

						const image = await axios.get(data.image, { responseType: 'arraybuffer' });

						data.scaleFactor = await canvas.scaleFactor(image.data, data.width);
						data.height = await canvas.height(image.data, data.scaleFactor);
						data.source = await canvas.templateSource(await canvas.detemplatize(image.data, data.width, data.height, data.scaleFactor), pxls.info().palette);
					} else {
						data = {
							reference: value,
						};
					}
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Key \`${key}\` does not exist!\nUse \`/template view ${name}\` to see arguments.`);
					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				}

				await database.editTemplate(name, interaction.guild_id, data);

				const template = (key === 'name') ? await database.getTemplate(value.trim().split(/ +/).shift(), interaction.guild_id) : await database.getTemplate(name, interaction.guild_id);

				if (template == null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${name}\` does not exist!\nYou can create it with \`/template add ${name} <template url>\`!`);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
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
								`height: ${template.height},\n` +
								`scaleFactor: ${template.scaleFactor},\n` +
								`reference: '${template.reference}'\`\`\``);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				}
			} else if (command === 'remove') {
				const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
				client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

				const name = (args.find(option => option.name == 'name')) ? args.find(option => option.name == 'name').value : null;

				const result = await database.removeTemplate(name, interaction.guild_id);
				if (result.deletedCount > 0) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:white_check_mark: Deleted template \`${name}\`!`);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${name}\` does not exist!`);

					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				}

			} else if (command === 'list') {
				const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
				client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

				const templates = await database.listTemplates(interaction.guild_id);

				const results = [];

				await templates.forEach(result => {
					results.push(`\`${result.name}\` - ${result.title}`);
				});

				if (results.length === 0) results.push('There are no templates in this progress checker!');

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription(results.join('\n'));

				return webhook.editMessage('@original', {
					embeds: [embed.toJSON()],
				});
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You don\'t have permission to add or manage templates!');

			return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
				},
			} });
		}
	},
};