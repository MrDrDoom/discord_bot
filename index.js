/* Logging in with Token */

// creating client that requires discord.js package
const Discord = require("discord.js");
const client = new Discord.Client();

const token = require("./token.js");

var scrims = {};
// I can manipulate this class to be more of a team decision making tool
class Scrim {
    constructor(message, maxPlayers) {
        this.message = message;
        this.maxPlayers = maxPlayers;
        this.players = [];
    }

    addPlayer(id) {
        this.players.push(id)
        this.announcePlayerCount()

        if(this.players.length === this.maxPlayers) {
            this.handleFullMatch()
        }
    }

    announcePlayerCount() {
        this.message.channel.send("There are " + this.players.length + " players in this scrim");
    }

    handleFullMatch() {
        var teamOne = [];
        var teamTwo = [];
        var shufflePlayers = shuffle([...this.players]);  // using spread operator to create copy of original list

        shufflePlayers.forEach((player, i) => {
            var tag = "<@" + player + ">";
            if(i % 2) {
                teamOne.push(tag)
            } else {
                teamTwo.push(tag)
            }
        })

        this.message.channel.send([
            "",
            '*** SCRIM TEAMS ***',
            'Team One: ' + teamOne.join(", "),
            '***VS***',
            'Team Two: ' + teamTwo.join(", ")
        ]).then(() => { // edit original message to indicate full party
            this.message.edit("SCRIM FILLED")
            delete scrims[this.message.id];
        })
    }
}

// list shuffler to generate random teams given input
function shuffle(a) {
    for(let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * TODO: screenshot following code for wiki example
 * I need to remember 'client.on' calls are used as a type of event listener
 */

// write username to console on when app starts
client.on('ready', () => {
    console.log('Logged in as %s!', client.user.tag);
});

client.on('message', msg => {
    if(msg.content.startsWith("!richard")) {
        var playerSlots = 4;
        var promptText = 'Scrim created with ' + playerSlots +' slots. Add a reaction to join!';
        msg.reply(promptText).then(botMsg => {
            scrims[botMsg.id] = new Scrim(botMsg, playerSlots);
        });
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(reaction.partial) {
        // wait for stable notification
        try {
            await reaction.fetch();
        } catch(error) {
            console.log('Something went wrong fetching the message: %e', error);
            return;
        }
    }
    var scrim = scrims[reaction.message.id];
    if(scrim) {
        scrim.addPlayer(user.id);
    }
});

// this links the code to the discord bot
client.login(token);