require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

const pxls = require('./src/pxls');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity('pxls.space', { type: 'WATCHING' });
	pxls.init();
});

client.ws.on('INTERACTION_CREATE', async interaction => {
	interaction.timestamp = Date.now();
	const guild = ((interaction.guild_id) ? client.guilds.cache.get(interaction.guild_id) : null);
	const channel = client.channels.cache.get(interaction.channel_id);
	const user = await ((interaction.member.user.id) ? client.users.fetch(interaction.member.user.id) : client.users.fetch(interaction.user.id));

	const command = client.commands.get(interaction.data.name) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.data.name));

	if (!command) return;

	if (command.guildOnly && !guild) {
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setDescription(':x: I can\'t execute that command inside DMs!');

		return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
			type: 4,
			data: {
				embeds: [embed.toJSON()],
			},
		} });
	}

	if (command.permissions && interaction.member.permissions) {
		const authorPerms = channel.permissionsFor(user);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You can not do this!');
			return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
				},
			} });
		}
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(user.id)) {
		const expirationTime = timestamps.get(user.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(`:x: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`/${command.name}\` command.`);
			return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
				type: 4,
				data: {
					embeds: [embed.toJSON()],
				},
			} });
		}
	} else {
		timestamps.set(user.id, now);
		setTimeout(() => timestamps.delete(user.id), cooldownAmount);
	}

	try {
		command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setDescription(':x: There was an error trying to execute that command!');
		return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
			type: 4,
			data: {
				embeds: [embed.toJSON()],
			},
		} });
	}
});

client.login(process.env.BOT_TOKEN);
