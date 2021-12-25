const canvas = require('../../handlers/canvas');
const database = require('../../handlers/database');
const pxls = require('../../handlers/pxls');

const axios = require('axios');
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('layer')
		.setDescription('Layers multiple templates on top of each other. Templates prioritized by order in command.')
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template1')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(true),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template2')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(true),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template3')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template4')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template5')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template6')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template7')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template8')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template9')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template10')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template11')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template12')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template13')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template14')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template15')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template16')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template17')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template18')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template19')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template20')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template21')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template22')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template23')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template24')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('template25')
				.setDescription('A template you want to layer. Can be a template link or a template name from the progress checker.')
				.setRequired(false),
		),
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const templates = [];

		const options = Array.from(interaction.options.data);

		for (let i = 0; i < options.length; i++) {
			if (!!options[i].value.match(/[#&?]template=.*?(&|$)/g) && !!options[i].value.match(/[#&?]ox=.*?(&|$)/g) && !!options[i].value.match(/[#&?]oy=.*?(&|$)/g) && !!options[i].value.match(/[#&?]tw=.*?(&|$)/g)) {
				const template = decodeURIComponent(options[i].value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g));
				const image = await axios.get(template, { responseType: 'arraybuffer' });

				templates.push({
					image: await canvas.detemplatize(image.data, parseInt(decodeURIComponent(options[i].value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)))),
					ox: parseInt(decodeURIComponent(options[i].value.match(/(?<=[#&?]ox=)(.*?)(?=&|$)/g))),
					oy: parseInt(decodeURIComponent(options[i].value.match(/(?<=[#&?]oy=)(.*?)(?=&|$)/g))),
					width: parseInt(decodeURIComponent(options[i].value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g))),
				});
			} else {
				const template = await database.getTemplate({
					name: options[i].value,
					gid: interaction.guildId,
					canvasCode: pxls.info().canvasCode,
				});
				if (template && template.source) {
					const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);
					templates.push({
						image: templateSource,
						ox: template.ox,
						oy: template.oy,
						width: template.width,
					});
				} else {
					const embed = new Discord.MessageEmbed();
					if (options[i].value.match(/[#&?]title=.*?(&|$)/g)) {
						embed.setColor(process.env.BOT_COLOR)
							.setDescription(`:x: Template ${decodeURIComponent(options[i].value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g))} does not exist!`);
					} else {
						embed.setColor(process.env.BOT_COLOR)
							.setDescription(`:x: Template ${options[i].value} does not exist!`);
					}
					return await interaction.editReply({ embeds: [embed] });
				}
			}
		}

		const layered = await canvas.layer(templates);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Layered!')
			.setImage('attachment://layered.png');

		await interaction.editReply({
			embeds: [embed],
			files: [{
				attachment: layered,
				name: 'layered.png',
			}],
		});
	},
};