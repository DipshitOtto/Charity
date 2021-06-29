const Discord = require('discord.js');
var ObjectId = require('mongodb').ObjectId;

const pxls = require('../pxls');
const database = require('./database');

let griefCounter = {};
let lastAttackDate = {};

module.exports = {
  async check(client, delay) {
		for (var id in griefCounter) {
			const template = await database.getTemplate({_id: ObjectId(id)})
      let users = Math.round(griefCounter[id] / ((60 * delay) / pxls.cooldown(await pxls.users())));
      if(users === 0) users = 1;
      // In case the case of a detected attack, we:
      // Send an embed if there were no attacks in the past 10 minutes
      // Ping the alert role if there were no attacks were detected in the past 30 minutes
      if(users >= template.alertThreshold) {
        if (!lastAttackDate[id] || Date.now() - lastAttackDate[id] > 10 * 60 * 1000) {
          // Send embed
          const embed = new Discord.MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setTitle(':warning: Grief Alert!')
            .setDescription(`Roughly **${users}** user(s) worth of force has been detected on ${template.title}!\n**[Template Link](${template.reference})**`);
          client.channels.cache.get(template.alertChannel).send(embed);
          if (template.alertRole && (!lastAttackDate[id] || Date.now()  - lastAttackDate[id] > 30 * 60 * 1000)) {
              // Ping
              client.channels.cache.get(template.alertChannel).send(`<@&${template.alertRole}>`);
            }
          }
        }
        lastAttackDate[id] = Date.now();
      };
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
			templates.forEach(template => {
				if(x >= template.ox && x < (template.ox + template.width) && y >= template.oy && y < (template.oy + template.height)) {
					const idx = template.width * (y - template.oy) + (x - template.ox);
					if(template.source[idx] != color && template.source[idx] != 255 && color != 255) {
						if(!griefCounter[template._id]) {
							griefCounter[template._id] = 0;
						}
						griefCounter[template._id] = griefCounter[template._id] + 1;
					}
				}
			});
		}
	},
};