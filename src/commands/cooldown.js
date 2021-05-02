const pxls = require('../pxls');

const Discord = require('discord.js');

module.exports = {
	name: 'cooldown',
	description: 'Gets the current canvas cooldown.',
	aliases: [],
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	options: [
		{
			'type': 4,
			'name': 'users',
			'description': 'The number of users you want to calculate the cooldown for.',
			'default': false,
			'required': false,
		},
	],
	async execute(interaction, client) {
		const webhook = new Discord.WebhookClient(client.user.id, interaction.token);
		client.api.interactions(interaction.id, interaction.token).callback.post({ data:{ type: 5 } });

		const users = (interaction.data.options) ? interaction.data.options.find(option => option.name == 'users').value : await pxls.users();
		const cooldown = await pxls.cooldown(users);

		if(users > 1386) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Users cannot exceed 1386!');

			return webhook.editMessage('@original', {
				embeds: [embed.toJSON()],
			});
		}

		let response = '';

		for(let i = 0; i < cooldown.length; i++) {
			response += `${i}/${cooldown.length} -> ${i + 1}/${cooldown.length} = ${cooldown[i][1]}\n`;
		}

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle(`Cooldown! (${users} Users)`)
			.setDescription(`\`\`\`js\n${response.trim()}\`\`\``);

		webhook.editMessage('@original', {
			embeds: [embed.toJSON()],
		});
	},
};