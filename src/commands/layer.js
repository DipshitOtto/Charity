const canvas = require('../handlers/canvas');
const database = require('../handlers/database');
const pxls = require('../pxls');

const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
	name: 'layer',
	description: 'Layers multiple templates on top of each other. Templates prioritized by order in command.',
	aliases: [],
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	options: [
		{
			name: 'template1',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: true,
		},
		{
			name: 'template2',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: true,
		},
		{
			name: 'template3',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template4',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template5',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template6',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template7',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template8',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template9',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template10',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template11',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template12',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template13',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template14',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template15',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template16',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template17',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template18',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template19',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template20',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template21',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template22',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template23',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template24',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
		{
			name: 'template25',
			type: 'STRING',
			description: 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			required: false,
		},
	],
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