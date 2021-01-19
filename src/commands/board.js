require('dotenv').config();

const canvas = require('../handlers/canvas');

const Discord = require('discord.js');

module.exports = {
	name: 'board',
	description: 'Gets the current state of the canvas.',
	aliases: ['canvas'],
	args: false,
	usage: '',
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	async execute(message) {
		const processing = await message.channel.send({
			embed: {
				title: '🔄 Processing...',
				color: process.env.BOT_COLOR,
			},
		});

		const board = await canvas.board();

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Board!')
			.attachFiles([board])
			.setImage('attachment://file.jpg');

		message.channel.send(embed).then(() => {
			processing.delete({ timeout: 0 });
		});
	},
};