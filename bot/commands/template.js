const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const Discord = require('discord.js');

const pxls = require('../../handlers/pxls');
const database = require('../../handlers/database');
const canvas = require('../../handlers/canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('template')
		.setDescription('Get a template link from a template in the progress checker.')
		.addStringOption(
			new SlashCommandStringOption()
				.setName('name')
				.setDescription('The name of the template link to get.')
				.setRequired(true),
		),
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const name = interaction.options.get('name');
		const template = await database.getTemplate({
			name: name.value,
			gid: interaction.guildId,
			canvasCode: pxls.info().canvasCode,
		});
		const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle(template.title)
			.setURL(template.reference)
			.setImage('attachment://template.png');

		await interaction.editReply({
			embeds: [embed],
			files: [{
				attachment: templateSource,
				name: 'template.png',
			}],
		});
	},
};