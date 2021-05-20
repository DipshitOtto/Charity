const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('./database');

let griefedPixels = {};
const hasPinged = {};
const lastUsers = {};

module.exports = {
	check(client, delay) {
		const templates = Object.keys(griefedPixels);
		templates.forEach(async id => {
			const template = griefedPixels[id];
			griefedPixels = {};

			let users = Math.round(template.griefedPixels / ((60 * delay) / pxls.cooldown(await pxls.users())));

			if(users === 0) users = 1;

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle(':warning: Grief Alert!')
				.setDescription(`Roughly **${users}** user(s) worth of force has been detected on ${template.title}!\n**[Template Link](${template.reference})**`);
			client.channels.cache.get(template.alertChannel).send(embed);
			if(!hasPinged[id] || hasPinged[id] < Date.now() - 30 * 60 * 1000) {
				if(!lastUsers[id] || lastUsers[id] < template.alertThreshold) {
					if(template.griefedPixels >= template.alertThreshold) {
						client.channels.cache.get(template.alertChannel).send(`<@&${template.alertRole}>`);
						hasPinged[id] = Date.now();
					}
				}
			}
			lastUsers[id] = users;
		});
	},
	async checkPixel(data) {
		for(let i = 0; i < data.pixels.length; i++) {
			const x = data.pixels[i].x;
			const y = data.pixels[i].y;
			const color = data.pixels[i].color;

			const templates = await database.listTemplates({
				canvasCode: pxls.info().canvasCode,
				alert: true,
			});
			await templates.forEach(template => {
				if(x >= template.ox && x < (template.ox + template.width) && y >= template.oy && y < (template.oy + template.height)) {
					const idx = template.width * (y - template.oy) + (x - template.ox);
					if(template.source[idx] != color && color != 255) {
						if(!griefedPixels[template._id]) {
							griefedPixels[template._id] = template;
							griefedPixels[template._id].griefedPixels = 0;
						}
						griefedPixels[template._id].griefedPixels = griefedPixels[template._id].griefedPixels + 1;
					}
				}
			});
		}
	},
};