require('dotenv').config();

const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'progress',
	description: 'Check the progress of any template in the progress checker.',
	aliases: ['check'],
	args: false,
	usage: '[template name] ["template"|"actual"]',
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	options: [
		{
			'type': 3,
			'name': 'name',
			'description': 'The name of the template you want to check the progress of.',
			'default': false,
			'required': false,
		},
		{
			'type': 3,
			'name': 'display',
			'description': 'How to display the template. Can be "diff", "actual", or "template".',
			'default': false,
			'required': false,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);

		const name = (interaction.data.options && interaction.data.options.find(option => option.name == 'name')) ? interaction.data.options.find(option => option.name == 'name').value : null;
		const display = (interaction.data.options && interaction.data.options.find(option => option.name == 'display')) ? interaction.data.options.find(option => option.name == 'display').value : null;

		if (!name || name === 'list') {
			const templates = await database.listTemplates(interaction.guild_id, pxls.info().canvasCode);

			const results = [];

			await templates.forEach(result => {
				results.push(`\`${result.name}\` - ${result.title}`);
			});

			if (results.length === 0) results.push('There are no templates in the progress checker!');

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(results.join('\n'));

			return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
				},
			} });
		} else {
			const template = await database.getTemplate(name, interaction.guild_id, pxls.info().canvasCode);
			if (template == null) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name}\` does not exist!\nYou can list templates with \`/progress list\`!`);

				return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
					type: 4,
					data: {
						embeds: [embed.toJSON()],
					},
				} });
			} else {
				client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

				const actual = await canvas.board(template.ox, template.oy, template.width, template.height);
				const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);

				const diff = await canvas.diffImages(templateSource, actual);

				let result;

				if (display && display.toLowerCase() === 'template') {
					result = templateSource;
				} else if (display && display.toLowerCase() === 'actual') {
					result = actual;
				} else {
					result = diff.generated;
				}

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(template.title)
					.setDescription(`Total Pixels: ${diff.totalPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nCorrect Pixels: ${diff.correctPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPixels To Go: ${diff.toGoPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPercentage Complete: ${diff.percentageComplete + '%'}`)
					.attachFiles([result])
					.setImage('attachment://file.jpg');

				webhook.editMessage('@original', {
					embeds: [embed.toJSON()],
					files: [{
						attachment: result,
						name: 'file.jpg',
					}],
				});
			}
		}
	},
};