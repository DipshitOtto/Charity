const canvas = require('../../handlers/canvas');

const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('board')
		.setDescription('Gets the current state of the canvas.'),
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const board = await canvas.board();

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Board!')
			.setImage('attachment://board.png');

		await interaction.editReply({
			embeds: [embed],
			files: [{
				attachment: board,
				name: 'board.png',
			}],
		});
	},
};