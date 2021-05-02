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
			'type': 3,
			'name': 'template1',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': true,
		},
		{
			'type': 3,
			'name': 'template2',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': true,
		},
		{
			'type': 3,
			'name': 'template3',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template4',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template5',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template6',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template7',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template8',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template9',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template10',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template11',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template12',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template13',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template14',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template15',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template16',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template17',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template18',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template19',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template20',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template21',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template22',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template23',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template24',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'template25',
			'description': 'A template you want to layer. Can be a template link or a template name from the progress checker.',
			'default': false,
			'required': false,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const templates = [];

		const options = (interaction.data.options) ? interaction.data.options : null;

		for(let i = 0; i < options.length; i++) {
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
				const template = await database.getTemplate(options[i].value, interaction.guild_id, pxls.info().canvasCode);
				if(template && template.source) {
					const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);
					templates.push({
						image: templateSource,
						ox: template.ox,
						oy: template.oy,
						width: template.width,
					});
				} else {
					const embed = new Discord.MessageEmbed();
					if(options[i].value.match(/[#&?]title=.*?(&|$)/g)) {
						embed.setColor(process.env.BOT_COLOR)
							.setDescription(`:x: Template ${decodeURIComponent(options[i].value.match(/(?<=[#&?]title=)(.*?)(?=&|$)/g))} does not exist!`);
					} else {
						embed.setColor(process.env.BOT_COLOR)
							.setDescription(`:x: Template ${options[i].value} does not exist!`);
					}
					return webhook.editMessage('@original', {
						embeds: [embed.toJSON()],
					});
				}
			}
		}

		const layered = await canvas.layer(templates);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Layered!')
			.setImage('attachment://file.jpg');

		webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
			files: [{
				attachment: layered,
				name: 'file.jpg',
			}],
		});
	},
};