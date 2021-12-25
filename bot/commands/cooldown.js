const pxls = require('../../handlers/pxls');

const { SlashCommandBuilder, SlashCommandIntegerOption } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cooldown')
		.setDescription('Gets the current canvas cooldown.')
		.addIntegerOption(
			new SlashCommandIntegerOption()
				.setName('users')
				.setDescription('The number of users you want to calculate the cooldown for.')
				.setRequired(false),
		),
	guildOnly: false,
	permissions: '',
	cooldown: 3,
	async execute(interaction) {
		if (!interaction.deferred && !interaction.replied) await interaction.deferReply();

		let users = interaction.options.get('users');
		if (!users) {
			users = await pxls.users();
		} else {
			users = users.value;
		}

		const cooldown = pxls.cooldown(users);

		function format(cd) {
			const hours = Math.floor(cd / 3600);
			let minutes = Math.floor((cd - (hours * 3600)) / 60);
			let seconds = (cd - (hours * 3600) - (minutes * 60)).toFixed(2);

			if (minutes < 10) {minutes = '0' + minutes;}
			if (seconds < 10) {seconds = '0' + seconds;}
			return minutes + ':' + seconds;
		}

		if (users > 1386) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: Users cannot exceed 1386!');

			return await interaction.editReply({ embeds: [embed] });
		}

		let response = '';

		for (let i = 0; i < 6; i++) {
			response += `${i}/6 -> ${i + 1}/6 = ${format(pxls.cooldownMultiplier(cooldown, i))}\n`;
		}

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle(`Cooldown! (${users} Users)`)
			.setDescription(`\`\`\`js\n${response.trim()}\`\`\``);

		await interaction.editReply({ embeds: [embed] });
	},
};