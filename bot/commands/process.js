const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandBooleanOption, SlashCommandIntegerOption } = require('@discordjs/builders');
const Discord = require('discord.js');
const axios = require('axios');

const { Pxls } = require('../../api/pxls');
const { Image } = require('../../api/image');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('process')
		.setDescription('Process a template image to the current Pxls palette.')
		.addStringOption(
			new SlashCommandStringOption()
				.setName('link')
				.setDescription('The link to the image you are processing.')
				.setRequired(true),
		)
		.addStringOption(
			new SlashCommandStringOption()
				.setName('matching')
				.setDescription('The type of palette matching to use. Default is "accurate".')
				.setRequired(false)
				.addChoices([['fast', 'fast'], ['accurate', 'accurate']]),
		)
		.addBooleanOption(
			new SlashCommandBooleanOption()
				.setName('dithering')
				.setDescription('Whether or not to use dithering. Default is false.')
				.setRequired(false),
		)
		.addIntegerOption(
			new SlashCommandIntegerOption()
				.setName('threshold')
				.setDescription('The threshold for dithering mixes. Can be 0-100. Default is 20.')
				.setRequired(false),
		),
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		const link = interaction.options.get('link');
		const matching = interaction.options.get('matching');
		const dithering = interaction.options.get('dithering');
		const threshold = interaction.options.get('threshold');

		if (threshold && threshold.value < 0) threshold.value = 0;
		if (threshold && threshold.value > 100) threshold.value = 100;

		const image = await axios.get(link.value, { responseType: 'arraybuffer' });
		if (image.data === undefined || image.data === null) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid image link!');

			return await interaction.editReply({ embeds: [embed] });
		}

		const pxls = new Pxls({
			site: new URL(process.env.PXLS_URL).host,
		});
		pxls.connect().then(async () => {
			const buffer = await Image.process(image.data, pxls.palette, matching ? matching.value : 'accurate', dithering ? dithering.value : false, threshold ? threshold.value : 20);

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Processed!')
				.setImage('attachment://processed.png');

			return await interaction.editReply({
				embeds: [embed],
				files: [{
					attachment: buffer,
					name: 'processed.png',
				}],
			});
		});
	},
};