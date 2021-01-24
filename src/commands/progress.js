require('dotenv').config();

const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('../handlers/database');
const canvas = require('../handlers/canvas');

module.exports = {
	name: 'progress',
	description: 'Check the progress of any template in the progress checker.',
	aliases: ['check'],
	args: false,
	usage: '[template name] [template|actual]',
	guildOnly: true,
	permissions: '',
	cooldown: 10,
	async execute(message, args) {
		if (args.length < 1 || args[0] === 'list') {
			const templates = await database.listTemplates(message.guild.id, pxls.info.canvasCode);

			const results = [];

			await templates.forEach(result => {
				results.push(`\`${result.name}\` - ${result.title}`);
			});

			if (results.length === 0) results.push('There are no templates in the progress checker!');

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle('Templates:')
				.setDescription(results.join('\n'));

			return message.channel.send(embed);
		} else {
			const template = await database.getTemplate(args[0], message.guild.id, pxls.info().canvasCode);
			if (template == null) {
				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setDescription(`:x: Template \`${args[0]}\` does not exist!\nYou can list templates with \`${process.env.BOT_PREFIX}progress list\`!`);

				return message.channel.send(embed);
			} else {
				const processing = await message.channel.send({
					embed: {
						title: '🔄 Processing...',
						color: process.env.BOT_COLOR,
					},
				});

				const actual = await canvas.board(template.ox, template.oy, template.width, template.height);
				const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);

				const diff = await canvas.diffImages(templateSource, actual);

				let result;

				if (args[1] && args[1].toLowerCase() === 'template') {
					result = templateSource;
				} else if (args[1] && args[1].toLowerCase() === 'actual') {
					result = actual;
				} else {
					result = diff.generated;
				}

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(template.title)
					.setDescription(`Total Pixels: ${diff.totalPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nCorrect Pixels: ${diff.correctPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPixels To Go: ${diff.toGoPixels.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\nPercentage Complete: ${diff.percentageComplete + '%'}`)
					.attachFiles([result])
					.setImage('attachment://file.jpg');

				message.channel.send(embed).then(() => {
					processing.delete({ timeout: 0 });
				}).catch(err => console.error(err));
			}
		}
	},
};