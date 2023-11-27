module.exports = {
    name: 'ping',
    description: 'Repond pong !',
    arguments: [{
        type: "STRING",
        name: "texte",
        description: "Texte à envoyer",
        required: false,
    }, {
        type: "USER",
        name: "user",
        description: "Mentionner un user à ping",
        required: false,
    }],
    async execute(interaction, args = {}) {
        try {
            let str = 'Pong!';
            if (args.texte) str += ' ' + args.texte;
            if (args.user) str += ' <@' + args.user + '>';
            await interaction.reply(str);
        } catch (error) {
            console.error(error);
        }
    }
};