module.exports = {
	name: 'ping',
	description: 'Ping!',
    aliases: [],
    args: false,
    usage: '',
    guildOnly: false,
    permissions: '',
    cooldown: 3,
	execute(message, args) {
		message.channel.send('Pong.');
	},
};