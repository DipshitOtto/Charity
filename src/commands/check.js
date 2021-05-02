const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'check',
	description: 'Check the progress of any template in the progress checker.',
	aliases: [],
	// aliases: ['check'],
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	options: [
		{
			'type': 1,
			'name': 'list',
			'description': 'List the templates in the progress checker.',
			'options': [],
		},
		{
			'type': 1,
			'name': 'progress',
			'description': 'Check the progress of any template in the progress checker.',
			'options': [
				{
					'type': 3,
					'name': 'name',
					'description': 'The name of the template you want to check the progress of.',
					'default': false,
					'required': true,
				},
				{
					'type': 5,
					'name': 'diff',
					'description': 'Whether to display the template as a diff image or a snapshot of it on the board. Defaults to true.',
					'default': false,
					'required': false,
				},
			],
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const subcommand = interaction.data.options[0];
		if (subcommand.name === 'list') {
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

			webhook.editMessage('@original', {
				embeds: [embed.toJSON()],
			});
		} else if (subcommand.name === 'progress') {
			const name = (subcommand.options && subcommand.options.find(option => option.name == 'name')) ? subcommand.options.find(option => option.name == 'name').value : null;
			const diff = (subcommand.options && subcommand.options.find(option => option.name == 'diff')) ? subcommand.options.find(option => option.name == 'diff').value : true;

			const template = await database.getTemplate(name, interaction.guild_id, pxls.info().canvasCode);
			if (template == null) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name}\` does not exist!\nYou can list templates with \`/progress list\`!`);

				webhook.editMessage('@original', {
					embeds: [embed.toJSON()],
				});
			} else {


				const actual = await canvas.board(template.ox, template.oy, template.width, template.height);
				const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);

				const diffImage = await canvas.diffImages(templateSource, actual);

				let result;

				if (diff) {
					result = diffImage.generated;
				} else {
					result = actual;
				}

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(template.title)
					.setDescription(`Total Pixels: ${diffImage.totalPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nCorrect Pixels: ${diffImage.correctPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPixels To Go: ${diffImage.toGoPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPercentage Complete: ${diffImage.percentageComplete + '%'}`)
					.setURL(template.reference)
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