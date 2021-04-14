const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	aliases: [],
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	options: [],
	execute(interaction, client) {
		fs.readFile('./src/assets/profile.png', function(err, buffer) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('🏓 Pong!')
				.setDescription(`${client.user.username}'s ping is \`${Date.now() - interaction.timestamp}ms\`.\nThe websocket ping is \`${Math.round(client.ws.ping)}ms\`.`)
				.setThumbnail('attachment://file.jpg');

			client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
					files: [{
						attachment: buffer,
						name: 'file.jpg',
					}],
				},
			} });
		});
	},
};