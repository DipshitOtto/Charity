const Discord = require('discord.js');

const pxls = require('../pxls');
const database = require('./database');
const canvas = require('../handlers/canvas');

const basicDelay = 6 * 1000;
const pixels = [];

module.exports = {
	async checkPixel(oldBoard, data, client) {
		for (let i = 0; i < data.pixels.length; i++) {
			const x = data.pixels[i].x;
			const y = data.pixels[i].y;
			const color = data.pixels[i].color;

			const templates = await database.listTemplates({
				canvasCode: pxls.info().canvasCode,
				alert: true,
			});

			templates.forEach(template => {
				const idx = template.width * (y - template.oy) + (x - template.ox);
				const shouldBe = template.source[idx];

				if (x >= template.ox && x < (template.ox + template.width) && y >= template.oy && y < (template.oy + template.height) && shouldBe != 255) {
					const pixelData = {
						x: x,
						y: y,
						color: color,
						oldColor: oldBoard[pxls.info().width * y + x],
						shouldBe: shouldBe,
						timestamp: Date.now(),
						template: template,
						parsed: false,
						alerted: false,
					};

					if (shouldBe != color) {
						pixelData.isCorrect = false;
						if (template.alertType === 'basic') {
							setTimeout(function() { module.exports.checkBasic(template, client); }, basicDelay);
						}
					} else {
						pixelData.isCorrect = true;
					}
					pixels.push(pixelData);
				}
			});
		}
	},
	async checkBasic(template, client) {
		const templatePixels = pixels.filter(pixel => pixel.template._id.toString() === template._id.toString());
		if (templatePixels.length === 0) return;

		const templateGriefs = module.exports.parseTemplatePixels(templatePixels, basicDelay);
		if (templatePixels.length === 0) return;
		const percentageComplete = await canvas.getPercentageComplete(template) + '%';
		const centerPixel = module.exports.getCenterFromGriefs(templateGriefs);
		const preview = await module.exports.getPreviewFromGriefs(templateGriefs);
		if (!preview) return;
		const embedContent = module.exports.createEmbedContent(templateGriefs);

		const embed = new Discord.MessageEmbed()
			.setColor(process.env.BOT_COLOR)
			.setTitle(':warning: Grief Alert!')
			.setAuthor(`${template.title} (${percentageComplete})`)
			.setDescription(embedContent)
			.setImage('attachment://grief.png');

		const row = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageButton()
					.setURL(module.exports.generatePxlsURL(template, centerPixel.x, centerPixel.y))
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
	},
	async checkAdvanced(client, delay) {
		const templates = await database.listTemplates({
			canvasCode: pxls.info().canvasCode,
			alert: true,
			alertType: 'advanced',
		});

		templates.forEach(async template => {
			const templatePixels = pixels.filter(pixel => pixel.template._id.toString() === template._id.toString());
			if (templatePixels.length === 0) return;

			const correctPixels = templatePixels.filter(pixel => pixel.isCorrect);
			const griefedPixels = templatePixels.filter(pixel => !pixel.isCorrect);
			let helpingUsers = Math.round(correctPixels.length / ((60 * delay) / pxls.cooldown(await pxls.users())));
			let griefingUsers = Math.round(griefedPixels.length / ((60 * delay) / pxls.cooldown(await pxls.users())));
			if (helpingUsers === 0 && correctPixels.length != 0) helpingUsers = 1;
			if (griefingUsers === 0 && griefedPixels.length != 0) griefingUsers = 1;

			const templateGriefs = module.exports.parseTemplatePixels(templatePixels, basicDelay);
			if (templatePixels.length === 0) return;
			const percentageComplete = await canvas.getPercentageComplete(template) + '%';
			const centerPixel = module.exports.getCenterFromGriefs(templateGriefs);
			const preview = await module.exports.getPreviewFromGriefs(templateGriefs);
			if (!preview) return;
			const pixelEmbedContent = module.exports.createEmbedContent(templateGriefs);
			let embedContent = `Roughly **${griefingUsers}** user(s) worth of force has been detected on ${template.title} in the past ${delay} minutes!\n`;

			if (griefingUsers > helpingUsers) {
				embedContent += `The griefers have been estimated to outnumber you by **${griefingUsers - helpingUsers}** user(s)!\n`;
			} else if (helpingUsers > griefingUsers) {
				embedContent += `You have been estimated to outnumber the griefers by **${helpingUsers - griefingUsers}** user(s)!\n`;
			} else {
				embedContent += 'Both you and the griefers have been estimated to have the same amount of users!\n';
			}

			if (griefedPixels.length > correctPixels.length) {
				embedContent += `The griefers have placed **${griefedPixels.length - correctPixels.length}** more pixels than you!\n`;
			} else if (correctPixels.length > griefedPixels.length) {
				embedContent += `You have placed **${correctPixels.length - griefedPixels.length}** more pixels than the griefers!\n`;
			} else {
				embedContent += 'You have placed the same amount of pixels as the griefers!\n';
			}

			embedContent += `\n${pixelEmbedContent}`;

			const embed = new Discord.MessageEmbed()
				.setColor(process.env.BOT_COLOR)
				.setTitle(':warning: Grief Alert!')
				.setAuthor(`${template.title} (${percentageComplete})`)
				.setDescription(embedContent)
				.setImage('attachment://grief.png');

			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setURL(module.exports.generatePxlsURL(template, centerPixel.x, centerPixel.y))
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
		});
		module.exports.clearExpiredPixels(false);
	},
	parseTemplatePixels(templatePixels, delay) {
		const parsedTemplatePixels = [];

		for (let i = 0; i < templatePixels.length; i++) {
			if (!templatePixels[i].parsed) {
				if (Date.now() - templatePixels[templatePixels.length - 1].timestamp >= delay || Date.now() - templatePixels[0].timestamp >= 60 * 1000) {
					const pixelHistory = templatePixels.filter(pixel => pixel.x === templatePixels[i].x && pixel.y === templatePixels[i].y && Date.now() - templatePixels[templatePixels.length - 1].timestamp >= delay);
					if (pixelHistory.length === 0) continue;
					for (let j = 0; j < pixelHistory.length; j++) {
						if (pixelHistory.indexOf(pixelHistory[j]) === pixelHistory.length - 1) {
							pixelHistory[j].parsed = true;
							const oldestPixel = pixelHistory[0];
							const newestPixel = pixelHistory[pixelHistory.length - 1];
							if (oldestPixel.oldColor === newestPixel.color) continue;
							if (newestPixel.color === newestPixel.shouldBe) continue;
							parsedTemplatePixels.push(newestPixel);
						}
					}
				}
			}
		}
		return parsedTemplatePixels;
	},
	getFramingFromGriefs(templateGriefs) {
		const framing = {
			left: pxls.info().width,
			right: 0,
			top: pxls.info().height,
			bottom: 0,
		};

		for (let i = 0; i < templateGriefs.length; i++) {
			const grief = templateGriefs[i];
			if (grief.x < framing.left) framing.left = grief.x;
			if (grief.x > framing.right) framing.right = grief.x;
			if (grief.y < framing.top) framing.top = grief.y;
			if (grief.y > framing.bottom) framing.bottom = grief.y;
		}

		return framing;
	},
	getCenterFromGriefs(templateGriefs) {
		const center = {};

		const framing = module.exports.getFramingFromGriefs(templateGriefs);

		if (framing.left <= framing.right && framing.top <= framing.bottom) {
			center.x = Math.round((framing.left + framing.right) / 2);
			center.y = Math.round((framing.top + framing.bottom) / 2);
		}

		return center;
	},
	async getPreviewFromGriefs(templateGriefs) {
		let preview;

		const framing = module.exports.getFramingFromGriefs(templateGriefs);

		if (framing.left <= framing.right && framing.top <= framing.bottom) {
			preview = await canvas.griefPreview(framing);
		}

		return preview;
	},
	createEmbedContent(templateGriefs) {
		const palette = pxls.info().palette;

		let embedContent = '';

		for (let i = 0; i < templateGriefs.length; i++) {
			const grief = templateGriefs[i];
			if (i < 5) {
				embedContent += `Pixel placed at [(${grief.x}, ${grief.y})](${module.exports.generatePxlsURL(grief.template, grief.x, grief.y)}) is ${palette[grief.color].name} (${grief.color}), should be ${palette[grief.shouldBe].name} (${grief.shouldBe}).\n`;
			} else if (i === 5) {
				embedContent += `and ${templateGriefs.length - 5} more...`;
			}
		}

		return embedContent.trim();
	},
	generatePxlsURL(template, x, y) {
		return `${process.env.PXLS_URL}#template=${template.image}&tw=${template.width}&oo=1&ox=${template.ox}&oy=${template.oy}&x=${x}&y=${y}&scale=50&title=${encodeURIComponent(template.title)}`;
	},
	clearExpiredPixels(basic) {
		let expiredPixels;
		if (basic) {
			expiredPixels = pixels.filter(pixel => pixel.template.alertType === 'basic' && Date.now() - pixel.timestamp >= basicDelay * 2);
		} else {
			expiredPixels = pixels.filter(pixel => pixel.template.alertType === 'advanced' && Date.now() - pixel.timestamp >= basicDelay * 2);
		}
		for (let i = 0; i < expiredPixels.length; i++) {
			pixels.splice(pixels.indexOf(expiredPixels[i]), 1);
		}
	},
};