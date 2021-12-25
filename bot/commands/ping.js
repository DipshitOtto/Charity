const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!'),
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	execute(interaction, client) {
		fs.readFile('./bot/assets/profile.png', async function(err, buffer) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('🏓 Pong!')
				.setDescription(`${client.user.username}'s ping is \`${Date.now() - interaction.timestamp}ms\`.\nThe websocket ping is \`${Math.round(client.ws.ping)}ms\`.`)
				.setThumbnail('attachment://profile.png');

			await interaction.reply({
				embeds: [embed],
				files: [{
					attachment: buffer,
					name: 'profile.png',
				}],
			});
		});
	},
};
