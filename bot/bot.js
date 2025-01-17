const fs = require('fs');
const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const websocket = require('../handlers/websocket');
const clock = require('../handlers/clock');

module.exports = {
	start() {
		const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
		client.commands = new Discord.Collection();

		const cooldowns = new Discord.Collection();

		const commandFiles = fs.readdirSync('./bot/commands').filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);
			client.commands.set(command.data.name, command);
		}

		client.once('ready', () => {
			console.log(`Logged in as ${client.user.tag}!`);
			client.user.setActivity('pxls.space', { type: 'WATCHING' });
			websocket.connect(client);
			clock.init(client);
		});

		client.on('guildCreate', guild => {
			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setURL(process.env.DISCORD_URL)
						.setLabel('Join the Discord!')
						.setStyle('LINK'),
					new Discord.MessageButton()
						.setURL(process.env.PATREON_URL)
						.setLabel('Support Charity on Patreon!')
						.setStyle('LINK'),
				);
			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle(':wave: Hi! I\'m Charity!')
				.setDescription('Charity is a discord bot that allows pxls.space factions and users to get information about Pxls, check progress on their templates, get alerted when their templates get griefed, and much, much more!\n\nYou can add templates to Charity with the `/manage template add` command.\n\nMake sure to check out the options below for more details!');
			if (guild.publicUpdatesChannel) {
				guild.publicUpdatesChannel.send({ embeds: [embed], components: [row] });
			} else {
				const channel = guild.channels.cache.find(chnl => chnl.type === 'GUILD_TEXT' && chnl.permissionsFor(guild.me).has('SEND_MESSAGES'));
				channel.send({ embeds: [embed], components: [row] });
			}
		});

		// Handle deploying, adding, and removing slash commands.
		client.on('messageCreate', async message => {
			if (!client.application?.owner) await client.application?.fetch();
			if (!message.content.startsWith(process.env.ADMIN_PREFIX) || message.author.id != client.application?.owner.id) return;

			const args = message.content.slice(process.env.ADMIN_PREFIX.length).trim().split(/ +/);
			const command = args.shift().toLowerCase();

			if (command === 'deploy') {
				const data = [];

				for (const file of commandFiles) {
					const commandFile = require(`./commands/${file}`);
					data.push(commandFile.data.toJSON());
				}
				const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
				(async () => {
					try {
						let embed = new Discord.MessageEmbed()
							.setColor(process.env.BOT_COLOR)
							.setDescription(':thinking: Deploying all slash commands globally...');
						message.channel.send({ embeds: [embed] });

						await rest.put(
							Routes.applicationCommands(process.env.APP_ID),
							{ body: data },
						);

						embed = new Discord.MessageEmbed()
							.setColor(process.env.BOT_COLOR)
							.setDescription(':white_check_mark: Deployed all slash commands globally!');
						message.channel.send({ embeds: [embed] });
					} catch (error) {
						console.error(error);
					}
				})();
			}

			if (command === 'slash') {
				const guild = message.guild.id;
				if (args[0] === 'add') {
					const slashCommand = client.commands.get(args[1]) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(args[1]));
					await client.guilds.cache.get(guild)?.commands.create(slashCommand.data);
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
			if (command === 'crash') {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(':white_check_mark: Crashing!');
				message.channel.send({ embeds: [embed] });
				process.abort();
			}
		});

		client.on('interactionCreate', async interaction => {
			if (interaction.isSelectMenu()) {
				if (interaction.message.type === 'APPLICATION_COMMAND') {
					const command = client.commands.get(interaction.message.interaction.commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.message.interaction.commandName));
					try {
						command.select(interaction);
					} catch (error) {
						console.error(error);
					}
				}
			}
			if (interaction.isButton()) {
				if (interaction.message.type === 'APPLICATION_COMMAND') {
					const command = client.commands.get(interaction.message.interaction.commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.message.interaction.commandName));
					try {
						command.button(interaction);
					} catch (error) {
						console.error(error);
					}
				}
			}
			if (!interaction.isCommand()) return;
			interaction.timestamp = Date.now();

			const command = client.commands.get(interaction.commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.commandName));

			if (!command) return;

			if (command.guildOnly && !interaction.inGuild()) {
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

			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Discord.Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const cooldownAmount = (command.cooldown || 3) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					const embed = new Discord.MessageEmbed()
						.setColor(process.env.BOT_COLOR)
						.setDescription(`:x: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`/${command.data.name}\` command.`);
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
	},
};