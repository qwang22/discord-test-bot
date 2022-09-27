const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
const commandsList = require('./assets/data/commands.json');
const textCommandsList = require('./assets/data/text-commands.json')
const responsesList = require('./assets/data/responses.json');
const { GamePicker } = require('./helpers/game-picker');
const { SecretSantaHelper } = require('./helpers/secret-santa');
const { TeamGenerator } = require('./helpers/team-generator');

class Main {

  client;
  prefix = "!caca"; // indicator to notify the bot of a command
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

      if (!message.content.startsWith(this.prefix)) {
        return this.handleResponse(message);
      } else {
        const content = message.content.toLowerCase().slice(this.prefix.length).trim().replace(/\s\s+/g, ' ');
  
        const command = content.split(' ')[0];
        const args = content.split(' ')?.slice(1).map(arg => { return arg });

        return this.handleTextCommand(message, command, args);
      }
    });
    
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      return this.handleSlashCommand(interaction);
    });
  }

  refreshAppCommands = async () => {
    const rest = new REST({ version: process.env.REST_VERSION }).setToken(process.env.TOKEN);
    const commands = commandsList.commands;
  
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

  handleResponse = (message) => {
    console.log(`User ${message.author.username} said ${message.content}`);

    const responsesArr = responsesList.responses;
    const response = responsesArr.find(x => x.message.toLowerCase() === message.content.toLowerCase());

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
  }

  handleTextCommand = async (message, commandText, args) => {
    const commandsArr = textCommandsList.commands;
    const command = commandsArr.find(c => c.name.toLowerCase() === commandText.toLowerCase());

    if (!command) {
      console.log(`Command ${commandText} not found`);
      return;
    }

    if (command.type === 'function') {
      return this[`${command.callback}`](message, args);
    }

    return;
  }

  handleSlashCommand = async (interaction) => {
    const commandsArr = commandsList.commands;
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
        return interaction.reply('/where commands are currently under construction and are non-functional');
        const target = command.name?.split('_')[1];
        let imagePath = '';
        // TODO - replace w/ target & userId values from dictionary
        if (target === 'alvin') {
          interaction.reply(`<@userId>`);
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

  makeTeams = (message, args) => {
    const teamGenerator = new TeamGenerator();
    const teams = teamGenerator.generateTeams(args, 2);

    const responseArr = teams.map(t => {
      return `${t.name}: ${t.players.join(', ')}`;
    });

    return message.channel.send(responseArr.join('\n'));
  }

  pickGame = (message, args) => {
    const gamePicker = new GamePicker(args);
    const game = gamePicker.pickGame();

    return message.channel.send(`Randomly chosen game: ${game}`);
  }

  secretSanta = async (message, args) => {
    const ssHelper = new SecretSantaHelper(args);
    const results = ssHelper.assignSecretSantas();
    
    for (const r of results) {
      const santa = await this.client.users.fetch(r.santa.substring(2, r.santa.length-1));
      const recipient = await this.client.users.fetch(r.recipient.substring(2, r.recipient.length-1));
      santa.send(`You are ${recipient.username}'s secret santa!`);
    }

    return message.channel.send('Done! Check your DMs for your result :)');
  }

}

const main = new Main();
main.up();