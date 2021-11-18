require('dotenv').config();

const website = require('./website/server');
const bot = require('./bot/bot');

website.start();
bot.start();