const pxls = require('../../handlers/pxls');
const database = require('../../handlers/database');
const canvas = require('../../handlers/canvas');
const pagination = require('../handlers/pagination');

const axios = require('axios');
const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandRoleOption } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');
const Discord = require('discord.js');

const interactionData = {};
const interactionDataTimeout = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('manage')
		.setDescription('Manage information, progress, and monitors for this server. Faction Admin Command.')
		.addSubcommandGroup(
			new SlashCommandSubcommandGroupBuilder()
				.setName('template')
				.setDescription('Manage a template in the template progress checker.')
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('add')
						.setDescription('Add a template to the progress checker.')
						.addStringOption(
							new SlashCommandStringOption()
								.setName('name')
								.setDescription('The name of the template you want to add to the progress checker.')
								.setRequired(true),
						)
						.addStringOption(
							new SlashCommandStringOption()
								.setName('link')
								.setDescription('The template link of the template you want to add to the progress checker.')
								.setRequired(true),
						),
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('remove')
						.setDescription('Remove a template from the progress checker.')
						.addStringOption(
							new SlashCommandStringOption()
								.setName('name')
								.setDescription('The name of the template you want to remove from the progress checker.')
								.setRequired(true),
						),
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('update')
						.setDescription('Update a template in the progress checker.')
						.addStringOption(
							new SlashCommandStringOption()
								.setName('name')
								.setDescription('The name of the template you want to update in the progress checker.')
								.setRequired(true),
						)
						.addStringOption(
							new SlashCommandStringOption()
								.setName('link')
								.setDescription('The template link of the template you want to update in the progress checker.')
								.setRequired(true),
						),
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('list')
						.setDescription('List the templates in the progress checker.'),
				),
		)
		.addSubcommandGroup(
			new SlashCommandSubcommandGroupBuilder()
				.setName('alert')
				.setDescription('Manage grief alert for a template in the template progress checker.')
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('add')
						.setDescription('Add grief alert for a template.')
						.addStringOption(
							new SlashCommandStringOption()
								.setName('type')
								.setDescription('The type of grief alert you want to add to the template.')
								.setRequired(true)
								.addChoices([['basic', 'basic'], ['advanced', 'advanced']]),
						)
						.addStringOption(
							new SlashCommandStringOption()
								.setName('name')
								.setDescription('The name of the template to alert griefs for.')
								.setRequired(true),
						)
						.addChannelOption(
							new SlashCommandChannelOption()
								.setName('channel')
								.setDescription('The channel grief alerts should be sent to.')
								.setRequired(true)
								.addChannelType(ChannelType.GuildText),
						)
						.addIntegerOption(
							new SlashCommandIntegerOption()
								.setName('threshold')
								.setDescription('The amount of griefers required for grief alert to trigger a ping. Not required for basic alerts.')
								.setRequired(false),
						)
						.addRoleOption(
							new SlashCommandRoleOption()
								.setName('role')
								.setDescription('The role to ping when the threshold is hit. Not required for basic alerts.')
								.setRequired(false),
						),
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('remove')
						.setDescription('Remove grief alert for a template.')
						.addStringOption(
							new SlashCommandStringOption()
								.setName('name')
								.setDescription('The name of the template to remove grief alert for.')
								.setRequired(true),
						),
				)
				.addSubcommand(
					new SlashCommandSubcommandBuilder()
						.setName('list')
						.setDescription('List the templates with grief alert.'),
				),
		),
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	async template(interaction, subcommand, stage) {
		if (subcommand.name === 'add') {
			if (stage === 0) {
				const name = subcommand.options.find(arg => arg.name === 'name');
				const link = subcommand.options.find(arg => arg.name === 'link');

				if (!name.value.match(/^[a-z0-9]+$/g)) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(':x: Template names may only contain letters, numbers, and must be lowercase! Try another name.');

					return await interaction.editReply({ embeds: [embed] });
				} else if (!!link.value.match(/[#&?]title=.*?(&|$)/g) && !!link.value.match(/[#&?]template=.*?(&|$)/g) && !!link.value.match(/[#&?]ox=.*?(&|$)/g) && !!link.value.match(/[#&?]oy=.*?(&|$)/g) && !!link.value.match(/[#&?]tw=.*?(&|$)/g)) {
					const image = await axios.get(decodeURIComponent(link.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)), { responseType: 'arraybuffer' });

					interactionData[interaction.id] = {};
					interactionData[interaction.id].template = {
						canvasCode: pxls.info().canvasCode,
						gid: interaction.guildId,
						name: name.value,
						hidden: false,
						title: decodeURIComponent(link.value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
						image: decodeURIComponent(link.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
						ox: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
						oy: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
						scaleFactor: await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))))),
						width: await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))),
						height: await canvas.height(image.data, await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))))),
						reference: link.value,
						source: await canvas.templateSource(await canvas.detemplatize(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))), await canvas.height(image.data, await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))))), await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))))), pxls.info().palette),
						alert: false,
						alertType: null,
						alertChannel: null,
						alertThreshold: 1,
						alertRole: null,
					};
					interactionDataTimeout.push({
						interaction: interaction.id,
						timestamp: Date.now(),
					});

					interactionData[interaction.id].interaction = interaction;
					interactionData[interaction.id].subcommand = subcommand;

					const imageLink = await axios.get(interactionData[interaction.id].template.image, { responseType: 'arraybuffer' });
					const template = await canvas.detemplatize(imageLink.data, interactionData[interaction.id].template.width);
					const actual = await canvas.board(interactionData[interaction.id].template.ox, interactionData[interaction.id].template.oy, interactionData[interaction.id].template.width, interactionData[interaction.id].template.height);
					const buffer = await canvas.managePreview(template, actual);

					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle(':jigsaw: Does this look correct?')
						.setDescription(`**Name:** \`${interactionData[interaction.id].template.name}\`\n**Title:** \`${interactionData[interaction.id].template.title}\`\n[Template Link](${interactionData[interaction.id].template.reference})`)
						.setImage('attachment://preview.png');

					const row = new Discord.MessageActionRow()
						.addComponents(
							new Discord.MessageButton()
								.setCustomId('template-yes')
								.setLabel('Yes')
								.setStyle('SUCCESS'),
							new Discord.MessageButton()
								.setCustomId('template-no')
								.setLabel('No')
								.setStyle('DANGER'),
						);
					return await interaction.editReply({
						embeds: [embed],
						files: [{
							attachment: buffer,
							name: 'preview.png',
						}],
						components: [row],
					}).then(reply => {
						interactionData[interaction.id].reply = reply;
					});
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(':x: You must provide a valid template link!\nThe proper usage would be: `/manage template add <template name> <template url>`');

					return await interaction.editReply({ embeds: [embed] });
				}
			} else if (stage === 1) {
				await database.addTemplate(interactionData[interaction.id].template.name, interaction.guildId, interactionData[interaction.id].template);

				const template = await database.getTemplate({
					name: interactionData[interaction.id].template.name,
					gid: interaction.guildId,
				});

				if (template === null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Couldn't create template \`${interactionData[interaction.id].template.name}\`!`);

					return await interaction.editReply({ embeds: [embed] });
				}

				const imageLink = await axios.get(interactionData[interaction.id].template.image, { responseType: 'arraybuffer' });
				const image = await canvas.detemplatize(imageLink.data, interactionData[interaction.id].template.width);

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(`:white_check_mark: Added ${interactionData[interaction.id].template.title} to Charity!`)
					.setDescription(`[Template Link](${interactionData[interaction.id].template.reference})`)
					.setImage('attachment://preview.png');
				interactionData[interaction.id].reply.removeAttachments();
				delete interactionData[interaction.id];
				return await interaction.editReply({
					embeds: [embed],
					files: [{
						attachment: image,
						name: 'preview.png',
					}],
					components: [],
				});
			}
		}
		if (subcommand.name === 'remove') {
			const name = subcommand.options.find(arg => arg.name === 'name');

			const template = await database.getTemplate({
				name: name.value,
				gid: interaction.guildId,
			});

			const result = await database.removeTemplate(name.value, interaction.guildId);
			if (result.deletedCount > 0) {
				const imageLink = await axios.get(template.image, { responseType: 'arraybuffer' });
				const image = await canvas.detemplatize(imageLink.data, template.width);

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(`:white_check_mark: Removed ${template.title} from Charity!`)
					.setDescription(`[Template Link](${template.reference})`)
					.setImage('attachment://preview.png');

				return await interaction.editReply({
					embeds: [embed],
					files: [{
						attachment: image,
						name: 'preview.png',
					}],
					components: [],
				});
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name.value}\` does not exist!`);

				return await interaction.editReply({ embeds: [embed] });
			}
		}
		if (subcommand.name === 'update') {
			if (stage === 0) {
				const name = subcommand.options.find(arg => arg.name === 'name');
				const link = subcommand.options.find(arg => arg.name === 'link');

				const template = await database.getTemplate({
					name: name.value,
					gid: interaction.guildId,
				});

				if (template == null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Template \`${name.value}\` does not exist!\nYou can create it with \`/manage template add ${name.value} <template url>\`!`);
					return await interaction.editReply({ embeds: [embed] });
				} else if (!!link.value.match(/[#&?]title=.*?(&|$)/g) && !!link.value.match(/[#&?]template=.*?(&|$)/g) && !!link.value.match(/[#&?]ox=.*?(&|$)/g) && !!link.value.match(/[#&?]oy=.*?(&|$)/g) && !!link.value.match(/[#&?]tw=.*?(&|$)/g)) {
					const image = await axios.get(decodeURIComponent(link.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)), { responseType: 'arraybuffer' });

					interactionData[interaction.id] = {};
					interactionData[interaction.id].template = {
						name: name.value,
						title: decodeURIComponent(link.value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g)),
						image: decodeURIComponent(link.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g)),
						ox: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
						oy: parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
						scaleFactor: await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))))),
						width: await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))),
						height: await canvas.height(image.data, await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))))),
						reference: link.value,
						source: await canvas.templateSource(await canvas.detemplatize(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))), await canvas.height(image.data, await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))))), await canvas.scaleFactor(image.data, await canvas.trueWidth(image.data, parseInt(decodeURIComponent(link.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))))), pxls.info().palette),
					};
					interactionDataTimeout.push({
						interaction: interaction.id,
						timestamp: Date.now(),
					});

					interactionData[interaction.id].interaction = interaction;
					interactionData[interaction.id].subcommand = subcommand;

					const imageLink = await axios.get(interactionData[interaction.id].template.image, { responseType: 'arraybuffer' });
					const templateImage = await canvas.detemplatize(imageLink.data, interactionData[interaction.id].template.width);
					const actual = await canvas.board(interactionData[interaction.id].template.ox, interactionData[interaction.id].template.oy, interactionData[interaction.id].template.width, interactionData[interaction.id].template.height);
					const buffer = await canvas.managePreview(templateImage, actual);

					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle(':jigsaw: Does this look correct?')
						.setDescription(`**Name:** \`${interactionData[interaction.id].template.name}\`\n**Title:** \`${interactionData[interaction.id].template.title}\`\n[Template Link](${interactionData[interaction.id].template.reference})`)
						.setImage('attachment://preview.png');

					const row = new Discord.MessageActionRow()
						.addComponents(
							new Discord.MessageButton()
								.setCustomId('template-yes')
								.setLabel('Yes')
								.setStyle('SUCCESS'),
							new Discord.MessageButton()
								.setCustomId('template-no')
								.setLabel('No')
								.setStyle('DANGER'),
						);
					return await interaction.editReply({
						embeds: [embed],
						files: [{
							attachment: buffer,
							name: 'preview.png',
						}],
						components: [row],
					}).then(reply => {
						interactionData[interaction.id].reply = reply;
					});
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(':x: You must provide a valid template link!\nThe proper usage would be: `/manage template update <template name> <template url>`');

					return await interaction.editReply({ embeds: [embed] });
				}
			} else if (stage === 1) {
				await database.editTemplate(interactionData[interaction.id].template.name, interaction.guildId, interactionData[interaction.id].template);

				const template = await database.getTemplate({
					name: interactionData[interaction.id].template.name,
					gid: interaction.guildId,
				});

				if (template === null) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Couldn't update template \`${interactionData[interaction.id].template.name}\`!`);

					return await interaction.editReply({ embeds: [embed] });
				}

				const imageLink = await axios.get(interactionData[interaction.id].template.image, { responseType: 'arraybuffer' });
				const image = await canvas.detemplatize(imageLink.data, interactionData[interaction.id].template.width);

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(`:white_check_mark: Updated ${interactionData[interaction.id].template.title}!`)
					.setDescription(`[Template Link](${interactionData[interaction.id].template.reference})`)
					.setImage('attachment://preview.png');
				interactionData[interaction.id].reply.removeAttachments();
				delete interactionData[interaction.id];
				return await interaction.editReply({
					embeds: [embed],
					files: [{
						attachment: image,
						name: 'preview.png',
					}],
					components: [],
				});
			}
		}
		if (subcommand.name === 'list') {
			interactionData[interaction.id] = {};
			interactionDataTimeout.push({
				interaction: interaction.id,
				timestamp: Date.now(),
			});

			interactionData[interaction.id].interaction = interaction;
			interactionData[interaction.id].subcommand = subcommand;

			const templates = await database.listTemplates({ gid: interaction.guildId });

			const results = [];
			const pages = [];

			await templates.forEach(async result => {
				results.push({
					name: result.name,
					title: result.title,
					percentageComplete: await canvas.getPercentageComplete(result),
				});
			});

			if (stage === 0) {
				results.sort((a, b) => a.name.localeCompare(b.name));
			} else if (stage === 1) {
				results.sort((a, b) => a.percentageComplete - b.percentageComplete);
			} else if (stage === 2) {
				results.sort((a, b) => b.percentageComplete - a.percentageComplete);
			}

			if (results.length === 0) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription('There are no templates in this server!');
				return await interaction.editReply({ embeds: [embed] });
			}

			for (let i = 0; i < Math.ceil(results.length / 10); i++) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:');

				for (let j = 0; j < 10; j++) {
					if (results[(i * 10) + j]) embed.addField(`\`${results[(i * 10) + j].name}\` - ${results[(i * 10) + j].title}`, `Percentage Complete: ${results[(i * 10) + j].percentageComplete}%`);
				}

				pages.push(embed);
			}

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageSelectMenu()
						.setCustomId('template')
						.setPlaceholder('Sort By...')
						.addOptions([
							{
								label: 'Alphabetical Order (Default)',
								description: 'Sort the templates by their name from A-Z.',
								value: 'alphabetical',
							},
							{
								label: 'Percentage Completion (Lowest)',
								description: 'Sort the templates by the lowest percentage completion first.',
								value: 'percentage_lowest',
							},
							{
								label: 'Percentage Completion (Highest)',
								description: 'Sort the templates by the highest percentage completion first.',
								value: 'percentage_highest',
							},
						]),
				);

			return pagination.init(interaction, pages, row);
		}
	},
	async alert(interaction, subcommand, stage) {
		if (subcommand.name === 'add') {
			if (stage === 0) {
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
				if (!template) {
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle('Templates:')
						.setDescription(`:x: Template ${name.value} doesn't exist! You can create it with \`/manage template add ${name.value} <template url>\`!`);
					return await interaction.editReply({ embeds: [embed] });
				}

				interactionData[interaction.id] = {};
				interactionData[interaction.id].template = {
					name: template.name,
					title: template.title,
					reference: template.reference,
				};
				if (type.value === 'basic') {
					interactionData[interaction.id].alert = {
						alert: true,
						alertType: 'basic',
						alertChannel: channel.value,
					};
				} else if (type.value === 'advanced') {
					interactionData[interaction.id].alert = {
						alert: true,
						alertType: 'advanced',
						alertChannel: channel.value,
						alertThreshold: threshold.value,
						alertRole: role.value,
					};
				}
				interactionDataTimeout.push({
					interaction: interaction.id,
					timestamp: Date.now(),
				});

				interactionData[interaction.id].interaction = interaction;
				interactionData[interaction.id].subcommand = subcommand;

				const imageLink = await axios.get(template.image, { responseType: 'arraybuffer' });
				const buffer = await canvas.detemplatize(imageLink.data, template.width);

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(':jigsaw: Does this look correct?')
					.setDescription(`**Name:** \`${template.name}\`\n**Title:** \`${template.title}\`\n[Template Link](${template.reference})\n\n**Alert:** ${(interactionData[interaction.id].alert.alert) ? 'Active' : 'Inactive'}\n**Alert Type:** ${(interactionData[interaction.id].alert.alertType === 'basic') ? 'Basic' : 'Advanced'}\n**Alert Channel:** <#${interactionData[interaction.id].alert.alertChannel}>\n**Alert Threshold:** ${(interactionData[interaction.id].alert.alertType === 'advanced') ? `${interactionData[interaction.id].alert.alertThreshold}` : 'N/A'}\n**Alert Role:** ${(interactionData[interaction.id].alert.alertType === 'advanced') ? `<@&${interactionData[interaction.id].alert.alertRole}>` : 'N/A'}\n\n${(interactionData[interaction.id].alert.alertType === 'basic') ? 'Basic grief alert will send a message to the specified channel every time an incorrect pixel is placed on the specified template. Basic grief alert will attempt to filter out mistakes, and will group pixels placed in succession together. Basic grief alert is best used for projects where you expect an occasional griefer from time to time, but not a large scale, organized attack.' : 'Advanced grief alert has all the functionality of basic grief alert, but is run less often, once every 5 minutes. Advanced grief alert will attempt to filter out mistakes, and will group pixels placed in succession together. In addition to the basic grief alert features, advanced grief alert will estimate how many people have placed on the specified template in the past 5 minutes, estimate how much the griefers outnumber you or you outnumber the griefers, and tell you the difference of pixels have been placed between you and the attacking party. Advanced grief alert will also ping the specified role if the threshold goes above the specified number of users. Advanced grief alert pings won\'t occur more than once per hour. Advanced grief alert is best used for projects where you expect a large scale, organized attack, and not when you expect an occasional griefer from time to time.'}`)
					.setImage('attachment://preview.png');

				const row = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageButton()
							.setCustomId('alert-yes')
							.setLabel('Yes')
							.setStyle('SUCCESS'),
						new Discord.MessageButton()
							.setCustomId('alert-no')
							.setLabel('No')
							.setStyle('DANGER'),
					);
				return await interaction.editReply({
					embeds: [embed],
					files: [{
						attachment: buffer,
						name: 'preview.png',
					}],
					components: [row],
				}).then(reply => {
					interactionData[interaction.id].reply = reply;
				});
			} else if (stage === 1) {
				if (interactionData[interaction.id].alert.alertType === 'basic') {
					await database.editTemplate(interactionData[interaction.id].template.name, interaction.guildId, interactionData[interaction.id].alert);
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setTitle(`:white_check_mark: Added basic grief alert to ${interactionData[interaction.id].template.title}!`)
						.setDescription(`[Template Link](${interactionData[interaction.id].template.reference})`)
						.setImage('attachment://preview.png');
					return await interaction.editReply({ embeds: [embed], components: [] });
				} else if (interactionData[interaction.id].alert.alertType === 'advanced') {
					await database.editTemplate(interactionData[interaction.id].template.name, interaction.guildId, interactionData[interaction.id].alert);
					const embed = new Discord.MessageEmbed()
						.setTitle(`:white_check_mark: Added advanced grief alert to ${interactionData[interaction.id].template.title}!`)
						.setDescription(`[Template Link](${interactionData[interaction.id].template.reference})`)
						.setImage('attachment://preview.png');
					return await interaction.editReply({ embeds: [embed], components: [] });
				}
			}
		}
		if (subcommand.name === 'remove') {
			const name = subcommand.options.find(arg => arg.name === 'name');

			const template = await database.getTemplate({
				name: name.value,
				gid: interaction.guildId,
				canvasCode: pxls.info().canvasCode,
			});
			if (!template) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription(`:x: Template ${name.value} doesn't exist! You can create it with \`/manage template add ${name.value} <template url>\`!`);
				return await interaction.editReply({ embeds: [embed] });
			}

			const imageLink = await axios.get(template.image, { responseType: 'arraybuffer' });
			const buffer = await canvas.detemplatize(imageLink.data, template.width);

			await database.editTemplate(name.value, interaction.guildId, { alert: false });
			const embed = new Discord.MessageEmbed()
				.setTitle(`:white_check_mark: Removed advanced grief alert from ${template.title}!`)
				.setDescription(`[Template Link](${template.reference})`)
				.setImage('attachment://preview.png');
			return await interaction.editReply({
				embeds: [embed],
				files: [{
					attachment: buffer,
					name: 'preview.png',
				}],
			});
		}
		if (subcommand.name === 'list') {
			interactionData[interaction.id] = {};
			interactionDataTimeout.push({
				interaction: interaction.id,
				timestamp: Date.now(),
			});

			interactionData[interaction.id].interaction = interaction;
			interactionData[interaction.id].subcommand = subcommand;

			const templates = await database.listTemplates({
				gid: interaction.guildId,
				canvasCode: pxls.info().canvasCode,
				alert: true,
			});

			const results = [];
			const pages = [];

			await templates.forEach(async result => {
				results.push({
					name: result.name,
					title: result.title,
					percentageComplete: await canvas.getPercentageComplete(result),
					alertType: result.alertType,
					alertChannel: result.alertChannel,
					alertThreshold: result.alertThreshold,
					alertRole: result.alertRole,
				});
			});

			if (stage === 0) {
				results.sort((a, b) => a.name.localeCompare(b.name));
			} else if (stage === 1) {
				results.sort((a, b) => a.percentageComplete - b.percentageComplete);
			} else if (stage === 2) {
				results.sort((a, b) => b.percentageComplete - a.percentageComplete);
			}

			if (results.length === 0) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:')
					.setDescription('There are no templates with grief alert in this server!');
				return await interaction.editReply({ embeds: [embed] });
			}

			for (let i = 0; i < Math.ceil(results.length / 5); i++) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle('Templates:');

				for (let j = 0; j < 5; j++) {
					if (results[(i * 5) + j]) embed.addField(`\`${results[(i * 5) + j].name}\` - ${results[(i * 5) + j].title}`, `Alert Type: ${(results[(i * 5) + j].alertType === 'basic') ? 'Basic' : 'Advanced'}\nAlert Channel: <#${results[(i * 5) + j].alertChannel}>${(results[(i * 5) + j].alertType === 'advanced') ? `\nAlert Threshold: ${results[(i * 5) + j].alertThreshold}` : ''}${(results[(i * 5) + j].alertType === 'advanced') ? `\nAlert Role: <@&${results[(i * 5) + j].alertRole}>` : ''}`);
				}

				pages.push(embed);
			}

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageSelectMenu()
						.setCustomId('alert')
						.setPlaceholder('Sort By...')
						.addOptions([
							{
								label: 'Alphabetical Order (Default)',
								description: 'Sort the templates by their name from A-Z.',
								value: 'alphabetical',
							},
							{
								label: 'Percentage Completion (Lowest)',
								description: 'Sort the templates by the lowest percentage completion first.',
								value: 'percentage_lowest',
							},
							{
								label: 'Percentage Completion (Highest)',
								description: 'Sort the templates by the highest percentage completion first.',
								value: 'percentage_highest',
							},
						]),
				);

			return pagination.init(interaction, pages, row);
		}
	},
	async button(interaction) {
		if (interaction.message.interaction.user.id === interaction.user.id) {
			if (interaction.customId === 'prevpage' || interaction.customId === 'nextpage') return pagination.button(interaction, interaction.message.components[1]);
			await interaction.update({ embeds: interaction.message.embeds, components: interaction.message.components }).finally(() => {
				if (interaction.customId === 'template-yes') module.exports.template(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 1);
				if (interaction.customId === 'alert-yes') module.exports.alert(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 1);
				if (interaction.customId === 'template-no' || interaction.customId === 'alert-no') interaction.message.delete();
			});
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You aren\'t the person who ran this command!');

			if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });
			return await interaction.followUp({ embeds: [embed], ephemeral: true });
		}
	},
	async select(interaction) {
		if (interaction.message.interaction.user.id === interaction.user.id) {
			await interaction.update({ embeds: interaction.message.embeds, components: interaction.message.components }).finally(() => {
				if (interaction.customId === 'template') {
					if (interaction.values[0] === 'alphabetical') module.exports.template(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 0);
					if (interaction.values[0] === 'percentage_lowest') module.exports.template(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 1);
					if (interaction.values[0] === 'percentage_highest') module.exports.template(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 2);
				} else if (interaction.customId === 'alert') {
					if (interaction.values[0] === 'alphabetical') module.exports.alert(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 0);
					if (interaction.values[0] === 'percentage_lowest') module.exports.alert(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 1);
					if (interaction.values[0] === 'percentage_highest') module.exports.alert(interactionData[interaction.message.interaction.id].interaction, interactionData[interaction.message.interaction.id].subcommand, 2);
				}
			});
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You aren\'t the person who ran this command!');

			if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });
			return await interaction.followUp({ embeds: [embed], ephemeral: true });
		}
	},
	async execute(interaction, client) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const authorPerms = interaction.member.permissionsIn(interaction.channelId);
		if (!client.application?.owner) await client.application?.fetch();
		if (interaction.user.id === client.application?.owner.id || authorPerms.has('BAN_MEMBERS') || authorPerms.has('MANAGE_GUILD')) {
			const subcommandGroup = interaction.options.data.find(option => option.name === interaction.options.getSubcommandGroup());
			if (subcommandGroup.name === 'template') {
				module.exports.template(interaction, subcommandGroup.options.find(option => option.name === interaction.options.getSubcommand()), 0);
			} else if (subcommandGroup.name === 'alert') {
				module.exports.alert(interaction, subcommandGroup.options.find(option => option.name === interaction.options.getSubcommand()), 0);
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You don\'t have permission to manage information, progress, and monitors for this server!');

			return await interaction.editReply({ embeds: [embed] });
		}
	},
	clearExpiredInteractions() {
		const expired = interactionDataTimeout.filter(interactionTimeout => Date.now() - interactionTimeout.timestamp >= 300000);
		for (let i = 0; i < expired.length; i++) {
			interactionDataTimeout.splice(interactionDataTimeout.indexOf(expired[i]), 1);
			if (interactionData[expired[i].interaction]) {
				interactionData[expired[i].interaction].interaction.editReply({ components: [] });
			}
			delete interactionData[interactionDataTimeout.interaction];
		}
	},
};