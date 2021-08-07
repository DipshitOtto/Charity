const canvas = require('../handlers/canvas');

const Discord = require('discord.js');

module.exports = {
	name: 'color',
	description: 'Preview a hex/rgb/named color.',
	aliases: [],
	guildOnly: false,
	permissions: '',
	cooldown: 5,
	options: [
		{
			name: 'color',
			type: 'STRING',
			description: 'Color to be previewed. Can be a 3 or 6 character hex code, an rgb array, or a color name.',
			required: true,
		},
	],
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