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
		const cooldown = pxls.cooldown(users);

		function format(cd) {
			const hours = Math.floor(cd / 3600);
			let minutes = Math.floor((cd - (hours * 3600)) / 60);
			let seconds = (cd - (hours * 3600) - (minutes * 60)).toFixed(2);

			if (minutes < 10) {minutes = '0' + minutes;}
			if (seconds < 10) {seconds = '0' + seconds;}
			return minutes + ':' + seconds;
		}

		if(users > 1386) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Users cannot exceed 1386!');

			return webhook.editMessage('@original', {
				embeds: [embed.toJSON()],
			});
		}

		let response = '';

		for(let i = 0; i < 6; i++) {
			response += `${i}/6 -> ${i + 1}/6 = ${format(pxls.cooldownMultiplier(cooldown, i))}\n`;
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