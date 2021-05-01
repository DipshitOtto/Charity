const canvas = require('../handlers/canvas');

const Discord = require('discord.js');

module.exports = {
	name: 'board',
	description: 'Gets the current state of the canvas.',
	aliases: [],
	// aliases: ['canvas'],
	guildOnly: true,
	permissions: '',
	cooldown: 10,
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