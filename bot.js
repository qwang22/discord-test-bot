const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const commandsData = require('./assets/data/commands.json');
const responsesData = require('./assets/data/responses.json');

class Main {

  client;
  indicator = ""; // indicator to notify the bot of a command
  members = [];

  up = () => {
    this.init();
    this.refreshAppCommands();
    this.login();
  }

  init = () => {
    // config env variables
    dotenv.config();

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
      partials: ['CHANNEL']
    });
    
    this.client.on('ready', async () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
      // temp logging to see data
      //console.log(await this.client.guilds.fetch());
      //this.getMembers(process.env.SERVER1_ID);
      //this.getChannels(process.env.SERVER1_ID)
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
        case 'where':
          const target = command.name?.split('_')[1];
          let imagePath = '';
          // TODO - replace w/ target & userId values from dictionary
          if (target === 'alvin') {
            interaction.reply(`<@551534587378008065>`);
            imagePath = './assets/images/where_alvin.png';
          } else if (target === 'poop') {
            imagePath = './assets/images/where_poop.png';
          }

          if (imagePath) {
            const channel = await this.getChannel(interaction.channelId);
            await channel.send({ files: [imagePath]});
          }
          
          break;
        default:
          console.log(`Action ${response.action} not found`);
          await interaction.reply('I did not understand :(');
          break;
      }

      return;
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

  login = async () => {
    await this.client.login(process.env.TOKEN);
  }

  getMembers = async (guildId) => {
    const guild = await this.client.guilds.fetch(guildId);
    const members = await guild.members.fetch();
    for (const member of members) {
      if (!member[1].user.bot) {
        this.members.push(member[1].user);
      }
    }
  }

  getChannels = async (guildId) => {
    const guild = await this.client.guilds.fetch(guildId);
    const channels = await guild.channels.fetch();
    const channelsList = [];
    for (const channel of channels) {
      channelsList.push({ id: channel[1].id, name: channel[1].name })
    }
    return channelsList;
  }

  getChannel = async (channelId) => {
    const guild = await this.client.guilds.fetch(process.env.SERVER2_ID);
    return guild.channels.fetch(channelId);
  }
}

const main = new Main();
main.up();
