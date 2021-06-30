require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');

const websocket = require('./src/handlers/websocket');
const clock = require('./src/handlers/clock');

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
	websocket.connect(client);
	clock.init(client);
});

// Handle deploying, adding, and removing slash commands.
client.on('message', async message => {
	if (!client.application?.owner) await client.application?.fetch();
	if (!message.content.startsWith(process.env.ADMIN_PREFIX) || message.author.id != client.application?.owner.id) return;

	const args = message.content.slice(process.env.ADMIN_PREFIX.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === 'deploy') {
		const data = [];

		for (const file of commandFiles) {
			const commandFile = require(`./src/commands/${file}`);
			if(commandFile.options) {
				data.push({
					'name': commandFile.name,
					'description': commandFile.description,
					'options': commandFile.options,
				});
				for (const alias of commandFile.aliases) {
					data.push({
						'name': alias,
						'description': commandFile.description,
						'options': commandFile.options,
					});
				}
			}
		}
		await client.application?.commands.set(data);
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setDescription(':white_check_mark: Deployed all slash commands globally!');
		message.channel.send({ embeds: [embed] });
	}

	if (command === 'slash') {
		const guild = message.guild.id;
		if (args[0] === 'add') {
			const slashCommand = client.commands.get(args[1]) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(args[1]));
			const data = {
				'name': slashCommand.name,
				'description': slashCommand.description,
				'options': slashCommand.options,
			};
			await client.guilds.cache.get(guild)?.commands.create(data);
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(`:white_check_mark: Added slash command ${args[1]}!`);
			message.channel.send({ embeds: [embed] });
		} else if (args[0] === 'remove') {
			const commands = await client.guilds.cache.get(guild)?.commands.fetch();
			const slashCommand = commands.find(cmd => {
				return cmd.name === args[1];
			});
			await client.guilds.cache.get(guild)?.commands.delete(slashCommand.id);
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(`:white_check_mark: Removed slash command ${args[1]}!`);
			message.channel.send({ embeds: [embed] });
		}
	}
});

client.on('interaction', async interaction => {
	if (!interaction.isCommand()) return;
	interaction.timestamp = Date.now();

	const command = client.commands.get(interaction.commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.commandName));

	if (!command) return;

	if (command.guildOnly && !interaction.guildID) {
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setDescription(':x: I can\'t execute that command inside DMs!');

		await interaction.reply({ embeds: [embed], ephemeral: true });
	}

	if (command.permissions) {
		const authorPerms = interaction.member.permissionsIn(interaction.channelID);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(':x: You can not do this!');
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}

	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setDescription(`:x: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`/${command.name}\` command.`);
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	} else {
		timestamps.set(interaction.user.id, now);
		setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	}

	try {
		command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setDescription(':x: There was an error trying to execute that command!');
		await interaction.reply({ embeds: [embed] });
	}
});

client.login(process.env.BOT_TOKEN);
