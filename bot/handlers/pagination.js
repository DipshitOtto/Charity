const Discord = require('discord.js');

const interactionData = {};
const interactionDataTimeout = [];

module.exports = {
	async init(interaction, pages, components) {
		if (!interaction && !interaction.channelId) throw new Error('Channel is inaccessible.');
		if (!pages) throw new Error('Pages are not given.');
		const page = 0;
		if (page !== pages.length - 1) {
			const row = new Discord.MessageActionRow()
				.addComponents(
					new Discord.MessageButton()
						.setCustomId('prevpage')
						.setLabel('⬅️ Previous Page')
						.setStyle('PRIMARY')
						.setDisabled(true),
					new Discord.MessageButton()
						.setCustomId('nextpage')
						.setLabel('Next Page ➡️')
						.setStyle('PRIMARY'),
				);
			await interaction.editReply({ embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)], components: [row, components] });
		} else {
			await interaction.editReply({ embeds: [pages[page]], components: [components] });
		}

		interactionData[interaction.id] = {
			page: page,
			pages: pages,
		};
		interactionDataTimeout.push({
			interaction: interaction.id,
			timestamp: Date.now(),
		});
	},
	async button(interaction, components) {
		if (interactionData[interaction.message.interaction.id]) {
			let page = interactionData[interaction.message.interaction.id].page;
			const pages = interactionData[interaction.message.interaction.id].pages;
			switch (interaction.customId) {
			case 'prevpage':
				page = page > 0 ? --page : pages.length - 1;
				interactionData[interaction.message.interaction.id].page = page;
				break;
			case 'nextpage':
				page = page + 1 < pages.length ? ++page : 0;
				interactionData[interaction.message.interaction.id].page = page;
				break;
			default:
				break;
			}

			let row;
			if (page === 0 && page === pages.length - 1) {
				row = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageButton()
							.setCustomId('prevpage')
							.setLabel('⬅️ Previous Page')
							.setStyle('PRIMARY')
							.setDisabled(true),
						new Discord.MessageButton()
							.setCustomId('nextpage')
							.setLabel('Next Page ➡️')
							.setStyle('PRIMARY')
							.setDisabled(true),
					);
			} else if (page === 0) {
				row = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageButton()
							.setCustomId('prevpage')
							.setLabel('⬅️ Previous Page')
							.setStyle('PRIMARY')
							.setDisabled(true),
						new Discord.MessageButton()
							.setCustomId('nextpage')
							.setLabel('Next Page ➡️')
							.setStyle('PRIMARY'),
					);
			} else if (page === pages.length - 1) {
				row = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageButton()
							.setCustomId('prevpage')
							.setLabel('⬅️ Previous Page')
							.setStyle('PRIMARY'),
						new Discord.MessageButton()
							.setCustomId('nextpage')
							.setLabel('Next Page ➡️')
							.setStyle('PRIMARY')
							.setDisabled(true),
					);
			} else {
				row = new Discord.MessageActionRow()
					.addComponents(
						new Discord.MessageButton()
							.setCustomId('prevpage')
							.setLabel('⬅️ Previous Page')
							.setStyle('PRIMARY'),
						new Discord.MessageButton()
							.setCustomId('nextpage')
							.setLabel('Next Page ➡️')
							.setStyle('PRIMARY'),
					);
			}

			interaction.update({ embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)], components: [row, components] });
		}
	},
	clearExpiredInteractions() {
		const expired = interactionDataTimeout.filter(interactionTimeout => Date.now() - interactionTimeout.timestamp >= 300000);
		for (let i = 0; i < expired.length; i++) {
			interactionDataTimeout.splice(interactionDataTimeout.indexOf(expired[i]), 1);

			if (interactionData[expired[i].interaction].interaction) {
				interactionData[expired[i].interaction].interaction.editReply({ components: [] });
			}
			delete interactionData[interactionDataTimeout.interaction];
		}
	},
};