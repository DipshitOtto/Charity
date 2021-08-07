const canvas = require('../handlers/canvas');

const Discord = require('discord.js');

module.exports = {
	name: 'board',
	description: 'Gets the current state of the canvas.',
	aliases: [],
	// aliases: ['canvas'],
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	options: [],
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