const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const commandsData = require('./commands.json');
const responsesData = require('./responses.json');

class Main {

  client;
  indicator = ""; // indicator to notify the bot of a command

  up() {
    this.init();
    this.refreshAppCommands();
    this.login();
  }

  init() {
    // config env variables
    dotenv.config();

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
      partials: ['CHANNEL']
    });
    
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });
    
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
    
      console.log(`User ${message.author.username} said ${message.content}`);

      const responsesArr = responsesData.responses;
      const response = responsesArr.find(x => x.message === message.content);

      if (!response) {
        console.log(`Response not found for message: ${message.content}`);
        return;
      }

      switch(response.action) {
        case 'send':
          message.channel.send(response.response);
          break;
        case 'reply':
          message.reply(response.response);
          break;
        default:
          console.log(`Action ${response.action} not found`);
          message.reply('I did not understand :)');
          break;
      }
    });
    
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const commandsArr = commandsData.commands;
      const command = commandsArr.find(x => x.name === interaction.commandName);

      if (!command) {
        console.log(`Command name ${interaction.commandName} not found`);
        return;
      }

      switch(command.action) {
        case 'reply':
          await interaction.reply(command.response);
          break;
        default:
          console.log(`Action ${response.action} not found`);
          await interaction.reply('I did not understand :(');
          break;
      }
    });
  }

  refreshAppCommands = async () => {
    const rest = new REST({ version: process.env.REST_VERSION }).setToken(process.env.TOKEN);
    const commands = commandsData.commands;
  
    try {
      console.log('Started refreshing application (/) commands.');
  
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  }

  login = () => {
    this.client.login(process.env.TOKEN);
  }
}

const main = new Main();
main.up();
