const { Partials, Client, GatewayIntentBits, ChannelType, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const express = require("express");
const cors = require("cors");
const minik = require("./minik.json");
const eventHandlers = require("./src/handlers/eventHandlers");
const { commandMap } = require("./src/handlers/commandHandler");

const client = new Client({
    intents: Object.keys(GatewayIntentBits).map(
        (Militan) => GatewayIntentBits[Militan]
    ),
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.openTickets = new Set();
client.commands = new Discord.Collection();
client.interactions = new Discord.Collection();
client.selectMenus = new Discord.Collection();
client.modals = new Discord.Collection();
eventHandlers(client);

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());



const rest = new REST({ version: "10" }).setToken(minik.botSettings.token);
(async () => {
    try {
        console.log("(/) komutları başlatıldı ve yenilendi!");

        await rest.put(
            Routes.applicationGuildCommands(
                minik.botSettings.clientID,
                minik.botSettings.ServerID
            ),
            { body: commandMap.map((cmd) => cmd.data.toJSON()) }
        );

        console.log("(/) komutları başarıyla yüklendi!");
    } catch (error) {
        console.error(error);
    }
})();

client
    .login(minik.botSettings.token)
    .then(() => {
        console.clear();
        console.log("[Minik API] " + client.user.username + " Giriş Yaptım.");
        console.log("[Minik API] " + "localhost:" + port + " Giriş Yaptım.");
    })
    .catch((err) => console.log(err));

client.on('messageCreate', message => {
    if (message.content.toLowerCase() === 'katalog') {
        message.channel.send(minik.ticket.mesajlar.katalog);
    }
});

