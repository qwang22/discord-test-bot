import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { RESTHelper } from './bot-rest-helper';
import { GamePicker } from '../helpers/game-picker';
import { SecretSantaHelper } from '../helpers/secret-santa';
import { TeamGenerator } from '../helpers/team-generator';
const textCommandsList = require('../assets/data/text-commands.json')
const responsesList = require('../assets/data/responses.json');

class Bot {
  client: Client | any; // TODO - use appropriate type
  prefix: string = "!caca"; // indicator to notify the bot of a command
  members = [];

  constructor() {}

  up = () => {
    this.init();
    this.deployCommands();
    this.login();
  }

  init = () => {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
      partials: ['CHANNEL' as any] // TODO - use appropriate type
    });

    this.registerCommands();

    this.client.on('ready', async () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
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

    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;
    
      const command = this.client.commands.get(interaction.commandName);
    
      if (!command) return;
    
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    });

  }

  login = async () => {
    await this.client.login(process.env.TOKEN);
  }

  registerCommands = () => {
    this.client.commands = new Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      this.client.commands.set(command.data.name, command);
    }
  }

  deployCommands = () => {
    const restHelper = new RESTHelper();
    return restHelper.refreshAppCommands();
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

  getChannel = async (guildId, channelId) => {
    const guild = await this.client.guilds.fetch(guildId);
    return guild.channels.fetch(channelId);
  }

  makeTeams = (message, args) => {
    const teamGenerator = new TeamGenerator();
    const teams = teamGenerator.generateTeams(args, 2);

    const responseArr = teams?.map(t => {
      return `${t.name}: ${t.players.join(', ')}`;
    });

    return message.channel.send(responseArr?.join('\n'));
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

export { Bot }