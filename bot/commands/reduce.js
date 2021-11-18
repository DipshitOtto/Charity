const Discord = require('discord.js');
const axios = require('axios');

const pxls = require('../../handlers/pxls');
const canvas = require('../../handlers/canvas');

module.exports = {
	name: 'reduce',
	description: 'Reduce a template image to the current Pxls palette.',
	aliases: [],
	// aliases: ['fiddle'],
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	options: [
		{
			name: 'link',
			type: 'STRING',
			description: 'The link to the image you are reducing.',
			required: true,
		},
	],
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const link = interaction.options.get('link');

		const image = await axios.get(link.value, { responseType: 'arraybuffer' });
		if (image.data === undefined || image.data === null) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid image link!');

			return await interaction.editReply({ embeds: [embed] });
		}
		const buffer = await canvas.reduce(image.data, pxls.info().palette);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Reduced!')
			.setImage('attachment://reduced.png');

		return await interaction.editReply({
			embeds: [embed],
			files: [{
				attachment: buffer,
				name: 'reduced.png',
			}],
		});
	},
};