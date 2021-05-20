const canvas = require('../handlers/canvas');

const Discord = require('discord.js');

module.exports = {
	name: 'users',
	description: 'Gets the number of users placing on the canvas.',
	aliases: [],
	guildOnly: true,
	permissions: '',
	cooldown: 3,
	options: [],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const board = await canvas.board();

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Board!')
			.setImage('attachment://file.jpg');

		webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
			files: [{
				attachment: board,
				name: 'file.jpg',
			}],
		});
	},
};