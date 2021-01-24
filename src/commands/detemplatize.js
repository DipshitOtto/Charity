require('dotenv').config();

const Discord = require('discord.js');
const axios = require('axios');

const canvas = require('../handlers/canvas');

module.exports = {
	name: 'detemplatize',
	description: 'Get the original 1:1 image from a template link.',
	aliases: ['detemp'],
	args: true,
	usage: '<template link>',
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	async execute(message, args) {
		if (!!args[0].match(/[#&?]template=.*?(&|$)/g) && !!args[0].match(/[#&?]tw=.*?(&|$)/g)) {
			const processing = await message.channel.send({
				embed: {
					title: '🔄 Processing...',
					color: process.env.BOT_COLOR,
				},
			});

			const template = decodeURIComponent(args[0].match(/(?<=[#&?]template=)(.*?)(?=&|$)/g));
			const width = parseInt(decodeURIComponent(args[0].match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)));

			const image = await axios.get(template, { responseType: 'arraybuffer' });
			const buffer = await canvas.detemplatize(image.data, width);

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Detemplatized!')
				.attachFiles([buffer])
				.setImage('attachment://file.jpg');

			return message.channel.send(embed).then(() => {
				processing.delete({ timeout: 0 });
			});
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid template link!');

			return message.channel.send(embed);
		}
	},
};