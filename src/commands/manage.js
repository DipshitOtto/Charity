const Discord = require('discord.js');
const axios = require('axios');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'manage',
	description: 'Manage information, progress, and monitors for this server. Faction Admin Command."',
	aliases: [],
	guildOnly: true,
	permissions: '',
	cooldown: 3,
	options: [
		{
			name: 'template',
			type: 'SUB_COMMAND_GROUP',
			description: 'Manage a template in the template progress checker.',
			options: [
				{
					name: 'view',
					type: 'SUB_COMMAND',
					description: 'View a template in the progress checker.',
					options: [
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template you want to view in the progress checker.',
							required: true,
						},
					],
				},
				{
					name: 'add',
					type: 'SUB_COMMAND',
					description: 'Add a template to the progress checker.',
					options: [
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template you want to add to the progress checker.',
							required: true,
						},
						{
							name: 'link',
							type: 'STRING',
							description: 'The template link of the template you want to add to the progress checker.',
							required: true,
						},
					],
				},
				/* {
					name: 'edit',
					type: 'SUB_COMMAND',
					description: 'Edit a template in the progress checker.',
					options: [
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template you want to edit in the progress checker.',
							required: true,
						},
						{
							name: 'key',
							type: 'STRING',
							description: 'The attribute of the template you want to edit.',
							required: true,
						},
						{
							name: 'value',
							type: 'STRING',
							description: 'The value of the attribute you want to edit.',
							required: true,
						},
					],
				},*/
				{
					name: 'remove',
					type: 'SUB_COMMAND',
					description: 'Remove a template from the progress checker.',
					options: [
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template you want to remove from the progress checker.',
							required: true,
						},
					],
				},
				{
					name: 'update',
					type: 'SUB_COMMAND',
					description: 'Update a template in the progress checker.',
					options: [
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template you want to update in the progress checker.',
							required: true,
						},
						{
							name: 'link',
							type: 'STRING',
							description: 'The template link of the template you want to update in the progress checker.',
							required: true,
						},
					],
				},
				{
					name: 'list',
					type: 'SUB_COMMAND',
					description: 'List the templates in the progress checker.',
				},
			],
		},
		{
			name: 'alert',
			type: 'SUB_COMMAND_GROUP',
			description: 'Manage grief alert for a template in the template progress checker.',
			options: [
				{
					name: 'add',
					type: 'SUB_COMMAND',
					description: 'Add grief alert for a template.',
					options: [
						{
							name: 'type',
							type: 'STRING',
							description: 'The type of grief alert you want to add to the template.',
							required: true,
							choices: [
								{
									name: 'basic',
									value: 'basic',
								},
								{
									name: 'advanced',
									value: 'advanced',
								},
							],
						},
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template to alert griefs for.',
							required: true,
						},
						{
							name: 'channel',
							type: 'CHANNEL',
							description: 'The channel grief alerts should be sent to.',
							required: true,
						},
						{
							name: 'threshold',
							type: 'INTEGER',
							description: 'The amount of griefers required for grief alert to trigger a ping. Not required for basic alerts.',
							required: false,
						},
						{
							name: 'role',
							type: 'ROLE',
							description: 'The role to ping when the threshold is hit. Not required for basic alerts.',
							required: false,
						},
					],
				},
				{
					name: 'remove',
					type: 'SUB_COMMAND',
					description: 'Remove grief alert for a template.',
					options: [
						{
							name: 'name',
							type: 'STRING',
							description: 'The name of the template to remove grief alert for.',
							required: true,
						},
					],
				},
				{
					name: 'list',
					type: 'SUB_COMMAND',
					description: 'List the templates with grief alert.',
				},
			],
		},
	],
	async template(interaction, subcommand) {
		subcommand = subcommand.find(option => option.name === interaction.options.getSubcommand());
		if (subcommand.name === 'view') {
			const name = subcommand.options.find(arg => arg.name === 'name');

			const template = await database.getTemplate({
				name: name.value,
				gid: interaction.guildId,
			});
			if (template == null) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name}\` does not exist!\nYou can create it with \`/manage template add ${name.value} <template url>\`!`);

				return await interaction.editReply({ embeds: [embed] });
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

				return await interaction.editReply({ embeds: [embed] });
			}
		} else if (subcommand.name === 'add') {
			const name = subcommand.options.find(arg => arg.name === 'name');
			const link = subcommand.options.find(arg => arg.name === 'link');

			if (!!link.value.match(/[#&?]title=.*?(&|$)/g) && !!link.value.match(/[#&?]template=.*?(&|$)/g) && !!link.value.match(/[#&?]ox=.*?(&|$)/g) && !!link.value.match(/[#&?]oy=.*?(&|$)/g) && !!link.value.match(/[#&?]tw=.*?(&|$)/g)) {
				const data = {
					canvasCode: pxls.info().canvasCode,
					gid: interaction.guildId,
					name: name.value,
					hidden: false,
					title: decodeURIComponent(link.value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
					image: decodeURIComponent(link.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
					ox: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
					oy: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
					width: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
					reference: link.value,
					alert: false,
					alertType: null,
					alertChannel: null,
					alertThreshold: 1,
					alertRole: null,
				};


				const image = await axios.get(data.image, { responseType: 'arraybuffer' });
				data.width = await canvas.trueWidth(image.data, data.width);
				data.scaleFactor = await canvas.scaleFactor(image.data, data.width);
				data.height = await canvas.height(image.data, data.scaleFactor);
				data.source = await canvas.templateSource(await canvas.detemplatize(image.data, data.width, data.height, data.scaleFactor), pxls.info().palette);

				await database.addTemplate(name.value, interaction.guildId, data);

				const template = await database.getTemplate({
					name: name.value,
					gid: interaction.guildId,
				});

				if (template === null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Couldn't create template \`${name.value}\`!`);

					return await interaction.editReply({ embeds: [embed] });
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

				return await interaction.editReply({ embeds: [embed] });
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(':x: You must provide a valid template link!\nThe proper usage would be: `/manage template add <template name> <template url>`');

				return await interaction.editReply({ embeds: [embed] });
			}
		/* } else if (command.name === 'edit') {
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
					height: parseInt(value),
				};
			} else if (key === 'scaleFactor') {
				data = {
					scaleFactor: parseInt(value),
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
					.setDescription(`:x: Key \`${key}\` does not exist!\nUse \`/manage template view ${name}\` to see arguments.`);
				return webhook.editMessage('@original', {
					embeds: [embed.toJSON()],
				});
			}

			await database.editTemplate(name, interaction.guild_id, data);

			const template = (key === 'name') ? await database.getTemplate({ name: value.trim().split(/ +/).shift(), gid: interaction.guild_id }) : await database.getTemplate({ name: name, gid: interaction.guild_id });

			if (template == null) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name}\` does not exist!\nYou can create it with \`/manage template add ${name} <template url>\`!`);

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
			}*/
		} else if (subcommand.name === 'remove') {
			const name = subcommand.options.find(arg => arg.name === 'name');

			const result = await database.removeTemplate(name.value, interaction.guildId);
			if (result.deletedCount > 0) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:white_check_mark: Deleted template \`${name.value}\`!`);

				return await interaction.editReply({ embeds: [embed] });
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name.value}\` does not exist!`);

				return await interaction.editReply({ embeds: [embed] });
			}
		} else if (subcommand.name === 'update') {
			const name = subcommand.options.find(arg => arg.name === 'name');
			const link = subcommand.options.find(arg => arg.name === 'link');

			if (!!link.value.match(/[#&?]title=.*?(&|$)/g) && !!link.value.match(/[#&?]template=.*?(&|$)/g) && !!link.value.match(/[#&?]ox=.*?(&|$)/g) && !!link.value.match(/[#&?]oy=.*?(&|$)/g) && !!link.value.match(/[#&?]tw=.*?(&|$)/g)) {
				const data = {
					title: decodeURIComponent(link.value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
					image: decodeURIComponent(link.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
					ox: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
					oy: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
					width: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
					reference: link.value,
				};

				const image = await axios.get(data.image, { responseType: 'arraybuffer' });
				data.width = await canvas.trueWidth(image.data, data.width);
				data.scaleFactor = await canvas.scaleFactor(image.data, data.width);
				data.height = await canvas.height(image.data, data.scaleFactor);
				data.source = await canvas.templateSource(await canvas.detemplatize(image.data, data.width, data.height, data.scaleFactor), pxls.info().palette);

				await database.editTemplate(name.value, interaction.guildId, data);

				const template = await database.getTemplate({
					name: name.value,
					gid: interaction.guildId,
				});

				if (template == null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${name.value}\` does not exist!\nYou can create it with \`/manage template add ${name.value} <template url>\`!`);

					return await interaction.editReply({ embeds: [embed] });
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
					return await interaction.editReply({ embeds: [embed] });
				}
			}
		} else if (subcommand.name === 'list') {
			const templates = await database.listTemplates({ gid: interaction.guildId });

			const results = [];

			await templates.forEach(result => {
				results.push(`\`${result.name}\` - ${result.title}`);
			});

			if (results.length === 0) results.push('There are no templates in this progress checker!');

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(results.join('\n'));

			return await interaction.editReply({ embeds: [embed] });
		}
	},
	async alert(interaction, subcommand, client) {
		subcommand = subcommand.find(option => option.name === interaction.options.getSubcommand());

		if (subcommand.name === 'add') {
			const type = subcommand.options.find(arg => arg.name === 'type');
			const name = subcommand.options.find(arg => arg.name === 'name');
			const channel = subcommand.options.find(arg => arg.name === 'channel');
			const threshold = subcommand.options.find(arg => arg.name === 'threshold');
			const role = subcommand.options.find(arg => arg.name === 'role');

			if (type.value === 'advanced' && (!threshold || !role)) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(':x: Advanced templates must include a threshold and a role!');

				return await interaction.editReply({ embeds: [embed] });
			}

			if (channel.channel.type != 'GUILD_TEXT') {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(':x: Grief alert channels must be guild text channels!');

				return await interaction.editReply({ embeds: [embed] });
			}

			const template = await database.getTemplate({
				name: name.value,
				gid: interaction.guildId,
				canvasCode: pxls.info().canvasCode,
			});
			if(!template) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription(`:x: Template ${name.value} doesn't exist! You can create it with \`/manage template add ${name.value} <template url>\`!`);
				return await interaction.editReply({ embeds: [embed] });
			}

			if (type.value === 'basic') {
				await database.editTemplate(name.value, interaction.guildId, {
					alert: true,
					alertType: 'basic',
					alertChannel: channel.value,
				});
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription(`:white_check_mark: Added basic grief alert to ${name.value}!`);
				return await interaction.editReply({ embeds: [embed] });
			} else if (type.value === 'advanced') {
				await database.editTemplate(name.value, interaction.guildId, {
					alert: true,
					alertType: 'advanced',
					alertChannel: channel.value,
					alertThreshold: threshold.value,
					alertRole: role.value,
				});
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription(`:white_check_mark: Added advanced grief alert to ${name.value}!`);
				return await interaction.editReply({ embeds: [embed] });
			}
		} else if (subcommand.name === 'remove') {
			const name = subcommand.options.find(arg => arg.name === 'name');

			const template = await database.getTemplate({
				name: name.value,
				gid: interaction.guildId,
				canvasCode: pxls.info().canvasCode,
			});
			if(!template) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription(`:x: Template ${name.value} doesn't exist! You can create it with \`/manage template add ${name.value} <template url>\`!`);
				return await interaction.editReply({ embeds: [embed] });
			}

			await database.editTemplate(name.value, interaction.guildId, { alert: false });
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(`:white_check_mark: Removed grief alert from ${name.value}!`);
			return await interaction.editReply({ embeds: [embed] });
		} else if (subcommand.name === 'list') {
			const templates = await database.listTemplates({
				gid: interaction.guildId,
				canvasCode: pxls.info().canvasCode,
				alert: true,
			});

			const results = [];

			await templates.forEach(result => {
				results.push(`\`${result.name}\` - ${result.title}`);
			});

			if (results.length === 0) results.push('There are no templates with grief alert!');

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(results.join('\n'));

			return await interaction.editReply({ embeds: [embed] });
		}
	},
	async execute(interaction, client) {
		await interaction.defer();

		const authorPerms = interaction.member.permissionsIn(interaction.channelId);
		if (!client.application?.owner) await client.application?.fetch();
		if (interaction.user.id === client.application?.owner.id || authorPerms.has('BAN_MEMBERS') || authorPerms.has('MANAGE_GUILD')) {
			const subcommandGroup = interaction.options.data.find(option => option.name === interaction.options.getSubcommandGroup());
			if(subcommandGroup.name === 'template') {
				module.exports.template(interaction, subcommandGroup.options, client);
			} else if(subcommandGroup.name === 'alert') {
				module.exports.alert(interaction, subcommandGroup.options, client);
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You don\'t have permission to manage information, progress, and monitors for this server!');

			return await interaction.editReply({ embeds: [embed] });
		}
	},
};