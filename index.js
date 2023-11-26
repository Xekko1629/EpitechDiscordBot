const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');

let config = require('./config.json');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log('I am ready!');
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
            for (let key in config["channel"]) {
                if (reaction.message.id == config["channel"][key].id) {
                    for (let i in config["channel"][key].emotes) {
                        if (reaction.emoji.name == config["channel"][key].emotes[i].emote) {
                            let realUser = await reaction.message.guild.members.fetch(user.id);
                            realUser.roles.add(config["channel"][key].emotes[i].roleID);
                            let role = await reaction.message.guild.roles.fetch(config["channel"][key].emotes[i].roleID);
                            realUser.send(`Ajout du rôle ${role.name} avec succès !`);
                        }
                    }
                }
            }
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}
});

client.on('messageReactionRemove', async (reaction, user) => {
	try {
		await reaction.fetch();
        for (let key in config["channel"]) {
            if (reaction.message.id == config["channel"][key].id) {
                for (let i in config["channel"][key].emotes) {
                    if (reaction.emoji.name == config["channel"][key].emotes[i].emote) {
                        let realUser = await reaction.message.guild.members.fetch(user.id);
                        realUser.roles.remove(config["channel"][key].emotes[i].roleID);
                        let role = await reaction.message.guild.roles.fetch(config["channel"][key].emotes[i].roleID);
                        realUser.send(`Retrait du rôle ${role.name} avec succès !`);
                    }
                }
            }
        }
	} catch (error) {
		console.error('Something went wrong when fetching the message:', error);
		return;
	}
});