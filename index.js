const { Client, IntentsBitField } = require('discord.js');

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildPresences] });
client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log('I am ready!');
});
