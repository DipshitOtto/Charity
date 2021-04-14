const Discord = require('discord.js');

module.exports = {
	name: 'color',
	description: 'Preview a hex color!',
	aliases: [],
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	options: [],
	execute(message) {
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Color Preview!')
			.setDescription('Coming soon!');

		message.channel.send(embed);
	},
};