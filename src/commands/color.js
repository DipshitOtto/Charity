const canvas = require('../handlers/canvas');

const Discord = require('discord.js');

module.exports = {
	name: 'color',
	description: 'Preview a hex/rgb/named color.',
	aliases: [],
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	options: [
		{
			'type': 3,
			'name': 'color',
			'description': 'Color to be previewed. Can be a 3 or 6 character hex code, an rgb array, or a color name.',
			'default': false,
			'required': true,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const color = (interaction.data.options) ? interaction.data.options.find(option => option.name == 'color').value : null;

		const buffer = await canvas.color(color);

		if(!buffer) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: That color doesn\'t exist!');

			return webhook.editMessage('@original', {
				embeds: [embed.toJSON()],
			});
		}

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Color Preview!')
			.setImage('attachment://file.jpg');

		webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
			files: [{
				attachment: buffer,
				name: 'file.jpg',
			}],
		});
	},
};