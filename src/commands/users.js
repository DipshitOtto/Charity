const Discord = require('discord.js');

const pxls = require('../pxls');

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

		const users = await pxls.users();

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Users!')
			.setDescription(`There are ${users} user(s) on the site right now.`);

		webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
		});
	},
};