const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const ping = require('./commands/ping.js');
const ticket = require('./commands/ticket.js')

let config = require('./config.json');

const {
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandIntegerOption,
	SlashCommandNumberOption,
	SlashCommandBooleanOption,
	SlashCommandUserOption,
	SlashCommandChannelOption,
	SlashCommandRoleOption,
	SlashCommandMentionableOption,
	SlashCommandAttachmentOption
} = require("@discordjs/builders");

function setOptionData(option, optionData) {
    option.setName(optionData.name);
    option.setDescription(optionData.description);
    if (optionData.required) option.setRequired(optionData.required);
    if (optionData.choices) option.setChoices(optionData.choices);
    if (optionData.autocomplete) option.setAutocomplete(optionData.autocomplete);

    return option;
}

async function setOption(slashCommand, optionData) {
    switch (optionData.type) {
        case "STRING": {
            await slashCommand.addStringOption(
                setOptionData(new SlashCommandStringOption(), optionData)
            );
            break;
        }
        case "INTEGER": {
            await slashCommand.addIntegerOption(
                setOptionData(new SlashCommandIntegerOption(), optionData)
            );
            break;
        }
        case "BOOLEAN": {
            await slashCommand.addBooleanOption(
                setOptionData(new SlashCommandBooleanOption(), optionData)
            );
            break;
        }
        case "USER": {
            await slashCommand.addUserOption(
                setOptionData(new SlashCommandUserOption(), optionData)
            );
            break;
        }
        case "CHANNEL": {
            await slashCommand.addChannelOption(
                setOptionData(new SlashCommandChannelOption(), optionData)
            );
            break;
        }
        case "ROLE": {
            await slashCommand.addRoleOption(
                setOptionData(new SlashCommandRoleOption(), optionData)
            );
            break;
        }
        case "MENTIONABLE": {
            await slashCommand.addMentionableOption(
                setOptionData(new SlashCommandMentionableOption(), optionData)
            );
            break;
        }
        case "ATTACHMENT": {
            await slashCommand.addMentionableOption(
                setOptionData(new SlashCommandAttachmentOption(), optionData)
            );
            break;
        }
    }

    return slashCommand;
}


const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.login(process.env.TOKEN);

let commands = [
    ping,
    ticket
];

client.on('ready', async () => {
    console.log('I am ready!');
    for (let i in commands) {
        let slashCommand = new SlashCommandBuilder().setName(commands[i].name).setDescription(commands[i].description);
        for (let y in commands[i].arguments) {
			await setOption(slashCommand, commands[i].arguments[y]);
		}
        await client.application.commands.fetch()
        let oldCmd = await client.application.commands.cache.find(
			(cmd) => cmd.name === commands[i].name
		);
		if (oldCmd) await oldCmd.delete();
        await client.application.commands.create(slashCommand);
        console.log(`Commande ${commands[i].name} chargée !`)
    }
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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    for (let i in commands) {
        if (interaction.commandName == commands[i].name) {
            let options = {};
            for (let i in interaction.options.data)
                options[interaction.options.data[i].name] = interaction.options.data[i].value;
            commands[i].execute(interaction, options);
        }
    }
});
