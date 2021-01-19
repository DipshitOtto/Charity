const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	aliases: [],
	args: false,
	usage: '',
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	execute(message) {
		fs.readFile('./assets/profile.png', function(err, buffer) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('🏓 Pong!')
				.setDescription(`${message.client.user.username}'s ping is \`${Date.now() - message.createdTimestamp}ms\`.\nThe websocket ping is \`${Math.round(message.client.ws.ping)}ms\`.`)
				.attachFiles([buffer])
				.setThumbnail('attachment://file.jpg');

			message.channel.send(embed);
		});
	},
};