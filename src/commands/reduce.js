require('dotenv').config();

const Discord = require('discord.js');
const axios = require('axios');

const pxls = require('../pxls');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'reduce',
	description: 'Reduce a template image to the current Pxls palette.',
	aliases: ['fiddle'],
	args: true,
	usage: '<image link>',
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	async execute(message, args) {
		const processing = await message.channel.send({
			embed: {
				title: '🔄 Processing...',
				color: process.env.BOT_COLOR,
			},
		});

		const image = await axios.get(args[0], { responseType: 'arraybuffer' });
		if (image.data === undefined || image.data === null) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid image link!');

			return message.channel.send(embed);
		}
		const buffer = await canvas.reduce(image.data, pxls.info().palette);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Reduced!')
			.attachFiles([buffer])
			.setImage('attachment://file.jpg');

		return message.channel.send(embed).then(() => {
			processing.delete({ timeout: 0 });
		});
	},
};