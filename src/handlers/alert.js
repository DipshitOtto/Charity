const Discord = require('discord.js');
const ObjectId = require('mongodb').ObjectId;

const pxls = require('../pxls');
const database = require('./database');
const canvas = require('../handlers/canvas');

let basicAlert = false;
const basicGriefCounter = {};
const advancedGriefCounter = {};
const lastAttackDate = {};

module.exports = {
	async checkBasic(client) {
		if (basicAlert) {
			for (const id in basicGriefCounter) {
				const board = pxls.board();
				const template = await database.getTemplate({ _id: ObjectId(id) });
				const palette = pxls.info().palette;
				const griefs = basicGriefCounter[id];
				if(basicGriefCounter[id].length === 0) continue;

				let embedContent = '';
				let pixelsPlaced = 0;
				const framing = {
					left: board.bitmap.width,
					right: 0,
					top: board.bitmap.height,
					bottom: 0,
				};

				for(let i = griefs.length - 1; i >= 0; i--) {
					const griefsOnPixel = basicGriefCounter[template._id].filter(e => e.x === griefs[i].x && e.y === griefs[i].y);
					if(griefsOnPixel[0] && griefsOnPixel[0].oldColor === griefsOnPixel[griefsOnPixel.length - 1].color) continue;
					const grief = griefsOnPixel[griefsOnPixel.length - 1];
					if(pixelsPlaced < 5) {
						embedContent += `Pixel placed at [(${grief.x}, ${grief.y})](${process.env.PXLS_URL}#template=${template.image}&tw=${template.width}&oo=1&ox=${template.ox}&oy=${template.oy}&x=${griefs[i].x}&y=${griefs[i].y}&scale=50&title=${encodeURIComponent(template.title)}) is ${palette[grief.color].name} (${grief.color}), should be ${palette[grief.shouldBe].name} (${grief.shouldBe}).\n`;
					} else if(pixelsPlaced === 5) {
						embedContent += 'and more...';
					}
					pixelsPlaced++;
					if(grief.x < framing.left) framing.left = grief.x;
					if(grief.x > framing.right) framing.right = grief.x;
					if(grief.y < framing.top) framing.top = grief.y;
					if(grief.y > framing.bottom) framing.bottom = grief.y;

					for(let j = 0; j < griefsOnPixel.length; j++) {
						const index = griefs.indexOf(griefsOnPixel[j]);
						if(index > -1) {
							griefs.splice(index, 1);
						}
					}
				}

				const centerX = Math.round((framing.left + framing.right) / 2);
				const centerY = Math.round((framing.top + framing.bottom) / 2);

				const actual = await canvas.board(template.ox, template.oy, template.width, template.height);
				const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);
				const diffImage = await canvas.diffImages(templateSource, actual);

				const preview = await canvas.griefPreview(framing);

				const embed = new Discord.MessageEmbed()
					.setColor(process.env.BOT_COLOR)
					.setTitle(':warning: Grief Alert!')
					.setAuthor(`${template.title} (${diffImage.percentageComplete + '%'})`)
					.setDescription(embedContent.trim())
					.setImage('attachment://grief.png');

				const row = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageButton()
							.setURL(`${process.env.PXLS_URL}#template=${template.image}&tw=${template.width}&oo=1&ox=${template.ox}&oy=${template.oy}&x=${centerX}&y=${centerY}&scale=50&title=${encodeURIComponent(template.title)}`)
							.setLabel('Template Link!')
							.setStyle('LINK'),
					);
				client.channels.cache.get(template.alertChannel).send({
					embeds:[embed],
					files: [{
						attachment: preview,
						name: 'grief.png',
					}],
					components: [row],
				});

				basicGriefCounter[id] = [];
			}
		}
		basicAlert = false;
	},
	async checkAdvanced(client, delay) {
		for (const id in advancedGriefCounter) {
			const board = pxls.board();
			const template = await database.getTemplate({ _id: ObjectId(id) });
			const palette = pxls.info().palette;
			const griefs = advancedGriefCounter[id];
			if(advancedGriefCounter[id].length === 0) continue;
			let users = Math.round(advancedGriefCounter[id].length / ((60 * delay) / pxls.cooldown(await pxls.users())));
			if(users === 0) users = 1;

			let embedContent = '';
			let pixelsPlaced = 0;
			const framing = {
				left: board.bitmap.width,
				right: 0,
				top: board.bitmap.height,
				bottom: 0,
			};

			for(let i = griefs.length - 1; i >= 0; i--) {
				const griefsOnPixel = advancedGriefCounter[template._id].filter(e => e.x === griefs[i].x && e.y === griefs[i].y);
				if(griefsOnPixel[0] && griefsOnPixel[0].oldColor === griefsOnPixel[griefsOnPixel.length - 1].color) continue;
				const grief = griefsOnPixel[griefsOnPixel.length - 1];
				if(pixelsPlaced < 5) {
					embedContent += `Pixel placed at [(${grief.x}, ${grief.y})](${process.env.PXLS_URL}#template=${template.image}&tw=${template.width}&oo=1&ox=${template.ox}&oy=${template.oy}&x=${griefs[i].x}&y=${griefs[i].y}&scale=50&title=${encodeURIComponent(template.title)}) is ${palette[grief.color].name} (${grief.color}), should be ${palette[grief.shouldBe].name} (${grief.shouldBe}).\n`;
				} else if(pixelsPlaced === 5) {
					embedContent += 'and more...';
				}
				pixelsPlaced++;
				if(grief.x < framing.left) framing.left = grief.x;
				if(grief.x > framing.right) framing.right = grief.x;
				if(grief.y < framing.top) framing.top = grief.y;
				if(grief.y > framing.bottom) framing.bottom = grief.y;

				for(let j = 0; j < griefsOnPixel.length; j++) {
					const index = griefs.indexOf(griefsOnPixel[j]);
					if(index > -1) {
						griefs.splice(index, 1);
					}
				}
			}

			const centerX = Math.round((framing.left + framing.right) / 2);
			const centerY = Math.round((framing.top + framing.bottom) / 2);

			const actual = await canvas.board(template.ox, template.oy, template.width, template.height);
			const templateSource = await canvas.parsePalette(template.source, pxls.info().palette, template.width, template.height);
			const diffImage = await canvas.diffImages(templateSource, actual);

			const preview = await canvas.griefPreview(framing);

			const embed = new Discord.MessageEmbed()
				.setTitle(':warning: Grief Alert!')
				.setAuthor(`${template.title} (${diffImage.percentageComplete + '%'})`)
				.setDescription(`Roughly **${users}** user(s) worth of force has been detected on ${template.title} in the past ${delay} minutes!\n\n` + embedContent.trim())
				.setImage('attachment://grief.png');
			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setURL(`${process.env.PXLS_URL}#template=${template.image}&tw=${template.width}&oo=1&ox=${template.ox}&oy=${template.oy}&x=${centerX}&y=${centerY}&scale=50&title=${encodeURIComponent(template.title)}`)
						.setLabel('Template Link!')
						.setStyle('LINK'),
				);
			client.channels.cache.get(template.alertChannel).send({
				embeds:[embed],
				files: [{
					attachment: preview,
					name: 'grief.png',
				}],
				components: [row],
			});
			if(users >= template.alertThreshold) {
				if (template.alertRole && (!lastAttackDate[id] || Date.now() - lastAttackDate[id] >= 60 * 60 * 1000)) {
					client.channels.cache.get(template.alertChannel).send(`<@&${template.alertRole}>`);
				}
			}
			advancedGriefCounter[id] = 0;
			lastAttackDate[id] = Date.now();
		}
	},
	async checkPixel(oldBoard, data, client) {
		for(let i = 0; i < data.pixels.length; i++) {
			const x = data.pixels[i].x;
			const y = data.pixels[i].y;
			const color = data.pixels[i].color;

			const basicTemplates = await database.listTemplates({
				canvasCode: pxls.info().canvasCode,
				alert: true,
				alertType: 'basic',
			});
			basicTemplates.forEach(template => {
				if(x >= template.ox && x < (template.ox + template.width) && y >= template.oy && y < (template.oy + template.height)) {
					const idx = template.width * (y - template.oy) + (x - template.ox);

					if(!basicGriefCounter[template._id]) {
						basicGriefCounter[template._id] = [];
					}

					const board = pxls.board();
					const griefData = {
						x: x,
						y: y,
						color: color,
						oldColor: oldBoard[board.bitmap.width * y + x],
						shouldBe: template.source[idx],
					};
					if(template.source[idx] != color && template.source[idx] != 255 && color != 255) {
						if(!basicAlert) {
							basicAlert = true;
							setTimeout(function() { module.exports.checkBasic(client); }, 6000);
						}
						basicGriefCounter[template._id].push(griefData);
					} else if(basicGriefCounter[template._id].some(e => e.x === x && e.y === y)) {
						basicGriefCounter[template._id].push(griefData);
					}
				}
			});

			const advancedTemplates = await database.listTemplates({
				canvasCode: pxls.info().canvasCode,
				alert: true,
				alertType: 'advanced',
			});
			advancedTemplates.forEach(template => {
				if(x >= template.ox && x < (template.ox + template.width) && y >= template.oy && y < (template.oy + template.height)) {
					const idx = template.width * (y - template.oy) + (x - template.ox);
					if(!advancedGriefCounter[template._id]) {
						advancedGriefCounter[template._id] = [];
					}

					const board = pxls.board();
					const griefData = {
						x: x,
						y: y,
						color: color,
						oldColor: oldBoard[board.bitmap.width * y + x],
						shouldBe: template.source[idx],
					};
					if(template.source[idx] != color && template.source[idx] != 255 && color != 255) {
						advancedGriefCounter[template._id].push(griefData);
					} else if(basicGriefCounter[template._id].some(e => e.x === x && e.y === y)) {
						advancedGriefCounter[template._id].push(griefData);
					}
				}
			});
		}
	},
};