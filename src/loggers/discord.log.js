'use strict';

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.on('ready', () => {
    console.log(`Log is as ${client.user.tag} !`);
})

const token = 'MTIxODgyMjg2MDQxMjI5MzE4MA.GJwAUe.DLzETfhXUglWiUijuH2_rMvY6S5sFTiGRXPQps'

client.login(token);

client.on('messageCreate', msg => {
    if(msg.author.bot) return;
    if(msg.content === 'hello'){
        msg.reply(`Welcome to ShopDev!!! What do you need? ...`)
    }
})