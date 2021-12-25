const canvas = require('../../handlers/canvas');

const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('color')
		.setDescription('Preview a hex/rgb/named color.')
		.addStringOption(
			new SlashCommandStringOption()
				.setName('color')
				.setDescription('Color to be previewed. Can be a 3 or 6 character hex code, an rgb array, or a color name.')
				.setRequired(true),
		),
	guildOnly: false,
	permissions: '',
	cooldown: 5,
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const color = interaction.options.get('color');

		const buffer = await canvas.color(color.value);

		if (!buffer) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: That color doesn\'t exist!');

			return await interaction.editReply({ embeds: [embed] });
		}

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Color Preview!')
			.setImage('attachment://color.png');

		await interaction.editReply({
			embeds: [embed],
			files: [{
				attachment: buffer,
				name: 'color.png',
			}],
		});
	},
};