const config = require('../config.json')
const { ChannelType } = require('discord.js')

module.exports = {
    name: 'ticket',
    description: 'Créer un ticket',
    arguments: [{
        type: "STRING",
        name: "texte",
        description: "Raison",
        required: true,
    }],
    async execute(interaction, args = {}) {
        try {
            let user = interaction.user
            let guild = interaction.guild
            if (guild.id != config["ticket"].guildID) {
                await interaction.reply({ content: `Cette commande n'est pas disponible sur ce serveur`, ephemeral: true })
                return;
            }
            let category = config["ticket"].categoryID
            let realCategory = guild.channels.cache.get(category)
            if (!realCategory)
                realCategory = await guild.channels.fetch(category)
            let dataChannel = [
                {
                    id: guild.id,
                    deny: ["ViewChannel"],
                },
                {
                    id: user.id,
                    allow: ["ViewChannel"]
                }
            ];
            await guild.channels.fetch();
            for (let [channelID, channel] of guild.channels.cache) {
                if (channel.type == 0 && channel.name == `ticket-${user.username}-${user.id}`) {
                    await channel.send({ embeds: [{ title: `Question: ${args.texte}`, description: `Bonjour <@${user.id}>,\n\nMerci d'avoir créé un ticket, un membre du staff va s'occuper de vous dans les plus brefs délais.\n\nCordialement,` }] })
                    await interaction.reply({ content: `Vous avez déjà un ticket : <#${channel.id}>`, ephemeral: true })
                    return;
                }
            }
            let newSecretaryCategory = await guild.channels.create({
				name: `ticket-${user.username}-${user.id}`,
				type: ChannelType.GuildText,
				permissionOverwrites: dataChannel,
				reason: "Nouveau Channel Ticket"
			});

            await newSecretaryCategory.setParent(realCategory, { lockPermissions: false })
            await newSecretaryCategory.send({ embeds: [{ title: `Question: ${args.texte}`, description: `Bonjour <@${user.id}>,\n\nMerci d'avoir créé un ticket, un membre du staff va s'occuper de vous dans les plus brefs délais.\n\nCordialement,` }] })
            await interaction.reply({ content: `Votre ticket a été créé : <#${newSecretaryCategory.id}>`, ephemeral: true })
        } catch (error) {
            console.error(error);
        }
    }
};