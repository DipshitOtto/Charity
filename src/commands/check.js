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
			name: 'list',
			type: 'SUB_COMMAND',
			description: 'List the templates in the progress checker.',
		},
		{
			name: 'progress',
			type: 'SUB_COMMAND',
			description: 'Check the progress of any template in the progress checker.',
			options: [
				{
					name: 'name',
					type: 'STRING',
					description: 'The name of the template you want to check the progress of.',
					required: true,
				},
				{
					name: 'display',
					type: 'STRING',
					description: 'How to display the template. Can be "difference", "actual", or "template". Defaults to "difference".',
					required: false,
					choices: [
						{
							name: 'difference',
							value: 'difference',
						},
						{
							name: 'actual',
							value: 'actual',
						},
						{
							name: 'template',
							value: 'template',
						},
					],
				},
			],
		},
	],
	async execute(interaction) {
		await interaction.defer();

		const subcommand = interaction.options.data.find(option => option.name === interaction.options.getSubcommand());
		if (subcommand.name === 'list') {
			const templates = await database.listTemplates({ gid: interaction.guildId, canvasCode: pxls.info().canvasCode });

			const results = [];

			await templates.forEach(result => {
				results.push(`\`${result.name}\` - ${result.title}`);
			});

			if (results.length === 0) results.push('There are no templates in the progress checker!');

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(results.join('\n'));

			return await interaction.editReply({ embeds: [embed] });
		} else if (subcommand.name === 'progress') {
			const name = subcommand.options.find(option => option.name === 'name');
			const display = subcommand.options.find(option => option.name === 'display');

			const template = await database.getTemplate({
				name: name.value,
				gid: interaction.guildId,
				canvasCode: pxls.info().canvasCode,
			});
			if (template == null) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${name.value}\` does not exist!\nYou can list templates with \`/progress list\`!`);

				return await interaction.editReply({ embeds: [embed] });
			} else {
				const actual = await canvas.board(template.ox, template.oy, template.width, template.height);
				const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);

				const diffImage = await canvas.diffImages(templateSource, actual);

				let result;

				if (display && display.value === 'template') {
					result = templateSource;
				} else if (display && display.value === 'actual') {
					result = actual;
				} else {
					result = diffImage.generated;
				}

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(template.title)
					.setDescription(`Total Pixels: ${diffImage.totalPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nCorrect Pixels: ${diffImage.correctPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPixels To Go: ${diffImage.toGoPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPercentage Complete: ${diffImage.percentageComplete + '%'}`)
					.setURL(template.reference)
					.setImage('attachment://progress.png');

				await interaction.editReply({
					embeds: [embed],
					files: [{
						attachment: result,
						name: 'progress.png',
					}],
				});
			}
		}
	},
};