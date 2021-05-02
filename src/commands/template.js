const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'template',
	description: 'Get a template link from a template in the progress checker.',
	aliases: [],
	// aliases: ['project', 'temp'],
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	options: [
		{
			'type': 3,
			'name': 'name',
			'description': 'The name of the template link to get.',
			'default': false,
			'required': true,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const name = (interaction.data.options) ? interaction.data.options.find(option => option.name == 'name').value : null;
		const template = await database.getTemplate(name, interaction.guild_id, pxls.info().canvasCode);
		const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle(template.title)
			.setURL(template.reference)
			.setImage('attachment://file.jpg');

		webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
			files: [{
				attachment: templateSource,
				name: 'file.jpg',
			}],
		});
	},
};