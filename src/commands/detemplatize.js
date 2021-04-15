const Discord = require('discord.js');
const axios = require('axios');

const canvas = require('../handlers/canvas');

module.exports = {
	name: 'detemplatize',
	description: 'Get the original 1:1 image from a template link.',
	aliases: ['detemp'],
	guildOnly: false,
	permissions: '',
	cooldown: 10,
	options: [
		{
			'type': 3,
			'name': 'link',
			'description': 'The link to the template you are detemplatizing.',
			'default': false,
			'required': true,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		const templateLink = interaction.data.options.find(option => option.name == 'link').value;

		if (!!templateLink.match(/[#&?]template=.*?(&|$)/g) && !!templateLink.match(/[#&?]tw=.*?(&|$)/g)) {
			client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

			const template = decodeURIComponent(templateLink.match(/(?<=[#&?]template=)(.*?)(?=&|$)/g));
			const width = parseInt(decodeURIComponent(templateLink.match(/(?<=[#&?]tw=)(.*?)(?=&|$)/g)));

			const image = await axios.get(template, { responseType: 'arraybuffer' });
			const buffer = await canvas.detemplatize(image.data, width);

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Detemplatized!')
				.setImage('attachment://file.jpg');

			return webhook.editMessage('@original', {
				embeds: [embed.toJSON()],
				files: [{
					attachment: buffer,
					name: 'file.jpg',
				}],
			});
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Invalid template link!');

			return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
				},
			} });
		}
	},
};