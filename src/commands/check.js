const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');
const pagination = require('../handlers/pagination');

const interactionData = {};
const interactionDataTimeout = [];

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
	async execute(interaction, stage = 0) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const subcommand = interaction.options.data.find(option => option.name === interaction.options.getSubcommand());
		if (subcommand.name === 'list') {
			interactionData[interaction.id] = {};
			interactionDataTimeout.push({
				interaction: interaction.id,
				timestamp: Date.now(),
			});

			interactionData[interaction.id].interaction = interaction;
			interactionData[interaction.id].subcommand = subcommand;

			const templates = await database.listTemplates({ gid: interaction.guildId, canvasCode: pxls.info().canvasCode });

			const results = [];
			const pages = [];

			await templates.forEach(async result => {
				results.push({
					name: result.name,
					title: result.title,
					percentageComplete: await canvas.getPercentageComplete(result),
				});
			});

			results.sort((a, b) => a.name.localeCompare(b.name));

			if (stage === 1) {
				results.sort((a, b) => a.percentageComplete - b.percentageComplete);
			} else if (stage === 2) {
				results.sort((a, b) => b.percentageComplete - a.percentageComplete);
			}

			if (results.length === 0) results.push('There are no templates in this progress checker!');

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
						.setCustomId('check')
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
	async button(interaction) {
		if (interaction.message.interaction.user.id === interaction.user.id) {
			if (interaction.customId === 'prevpage' || interaction.customId === 'nextpage') return pagination.button(interaction, interaction.message.components[1]);
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
				if (interaction.customId === 'check') {
					if (interaction.values[0] === 'alphabetical') module.exports.execute(interactionData[interaction.message.interaction.id].interaction, 0);
					if (interaction.values[0] === 'percentage_lowest') module.exports.execute(interactionData[interaction.message.interaction.id].interaction, 1);
					if (interaction.values[0] === 'percentage_highest') module.exports.execute(interactionData[interaction.message.interaction.id].interaction, 2);
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