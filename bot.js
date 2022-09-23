const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const dict = require('./commands.json');

class Main {

  client;

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
      switch(message?.content) {
        case 'test':
          message.channel.send('Test received! :)');
          break;
        case 'reply':
          message.reply('Replying to your message');
          break;
        case 'desiree sucks':
          message.channel.send('Yes, I agree, but Connor sucks more.');
          break;
      }
    });
    
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;
    
      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
      }
    });
  }

  refreshAppCommands = async () => {
    const rest = new REST({ version: process.env.REST_VERSION }).setToken(process.env.TOKEN);
    const commands = dict.commands;
  
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
