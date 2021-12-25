const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');
const Discord = require('discord.js');
const axios = require('axios');

const canvas = require('../../handlers/canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('detemplatize')
		.setDescription('Get the original 1:1 image from a template link.')
		.addStringOption(
			new SlashCommandStringOption()
				.setName('link')
				.setDescription('The link to the template you are detemplatizing.')
				.setRequired(true),
		),
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	async execute(interaction) {
		const templateLink = interaction.options.get('link');

		if (!!templateLink.value.match(/[#&?]template=.*?(&|$)/g) && !!templateLink.value.match(/[#&?]tw=.*?(&|$)/g)) {
			if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

			const template = decodeURIComponent(templateLink.value.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g));
			const width = parseInt(decodeURIComponent(templateLink.value.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)));

			const image = await axios.get(template, { responseType: 'arraybuffer' });
			const buffer = await canvas.detemplatize(image.data, width);

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Detemplatized!')
				.setImage('attachment://detemplatized.png');

			return await interaction.editReply({
				embeds: [embed],
				files: [{
					attachment: buffer,
					name: 'detemplatized.png',
				}],
			});
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid template link!');

			return await interaction.reply({ embeds: [embed] });
		}
	},
};