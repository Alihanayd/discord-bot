require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const getTFTData = require("./tft");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.DISCORD_API_KEY;

client.once("ready", () => {
  console.log("Bot is online!");
});

client.on("messageCreate", async (message) => {
  if (message.content === "!ping") {
    message.channel.send("Pong!");
  }
  if (message.author.bot) return;

  if (message.content.startsWith("!tft")) {
    const args = message.content.split(" ").slice(1).join(" ");
    const [playerName, playerID] = args.split("#");

    if (!playerName) {
      return message.channel.send(
        "Lütfen bir oyuncu adı girin. Kullanım: `!tft OyuncuAdı`"
      );
    }
    const response = await getTFTData(playerName, playerID);
    message.channel.send(response);
  }
});

client.login(TOKEN);
