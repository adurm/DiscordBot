const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const functions = require("./functions")
const { templates, objects } = require('./constants')
const embed = new Discord.MessageEmbed()

bot.once('ready', () => {
    console.log("Running...");
});

bot.on('message', (message) => {

    // Detect a bot command
    if (message.content.startsWith(config.prefix)) {
        functions.handleCommand(message, embed);
    }

    // Detect server invite links
    if (message.content.toLowerCase().includes('discord.gg/')) {
        functions.deleteInviteLinks(message)
    }
});

bot.on('messageReactionAdd', (reaction, user) => {
    functions.roleAssign(reaction, user, true, bot.guilds.cache.get(objects.serverID))
    functions.helpRoom(reaction, user, bot.guilds.cache.get(objects.serverID))
});

bot.on('messageReactionRemove', (reaction, user) => {
    functions.roleAssign(reaction, user, false, bot.guilds.cache.get(objects.serverID))
});

bot.on('guildMemberAdd', member => {
    functions.welcomeMessage(member, bot.channels.cache.get(objects.welcomeChannelID))
});

bot.login(config.token)
