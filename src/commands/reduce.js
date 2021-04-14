require('dotenv').config();

const Discord = require('discord.js');
const axios = require('axios');

const pxls = require('../pxls');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'reduce',
	description: 'Reduce a template image to the current Pxls palette.',
	aliases: ['fiddle'],
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	options: [
		{
			'type': 3,
			'name': 'link',
			'description': 'The link to the image you are reducing.',
			'default': false,
			'required': true,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const link = (interaction.data.options) ? interaction.data.options.find(option => option.name == 'link').value : null;

		const image = await axios.get(link, { responseType: 'arraybuffer' });
		if (image.data === undefined || image.data === null) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid image link!');

			return webhook.editMessage('@original', {
				embeds: [embed.toJSON()],
			});
		}
		const buffer = await canvas.reduce(image.data, pxls.info().palette);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle('Reduced!')
			.setImage('attachment://file.jpg');

		return webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
			files: [{
				attachment: buffer,
				name: 'file.jpg',
			}],
		});
	},
};