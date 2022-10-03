import * as Discord from 'discord.js';
import fs from 'fs';
import path from 'path';
import { RESTHelper } from './rest.helper';
import { CommandDispatcher } from './command.dispatcher';
import { ITextCommand, ITextCommandList } from './models/ITextCommand';
import { IMessageResponse, IMessageResponseList } from './models/IMessageResponse';

const textCommandsList: ITextCommandList = require('./assets/data/text-commands.json');
const responsesList: IMessageResponseList = require('./assets/data/message-responses.json');

class Bot {
  client: Discord.Client | any; // TODO - fix this
  prefix: string = "!caca"; // indicator to notify the bot of a command
  dispatcher: CommandDispatcher;
  textCommandsList: ITextCommand[];
  responsesList: IMessageResponse[];

  constructor() {
    this.textCommandsList = textCommandsList.commands;
    this.responsesList = responsesList.responses;
    this.dispatcher = new CommandDispatcher();
  }

  up = async () => {
    this.init();
    if (process.env.DEPLOY_COMMANDS === 'yes') await this.deployCommands();
    this.login();
  }

  init = () => {
    this.client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.DirectMessages],
      partials: [Discord.Partials.Channel]
    });

    this.registerCommands();

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });

    this.client.on('messageCreate', (message: Discord.Message) => {
      if (message.author.bot) return;

      if (!message.content.startsWith(this.prefix)) {
        return this.handleResponse(message);
      } else {
        const content: string = message.content.toLowerCase().slice(this.prefix.length).trim().replace(/\s\s+/g, ' ');
  
        const command = content.split(' ')[0];
        const args: string[] = content.split(' ')?.slice(1).map(arg => { return arg });

        return this.handleTextCommand(message, command, args);
      }
    });

    // slash commands
    this.client.on('interactionCreate', async (interaction: Discord.CommandInteraction) => {
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

  login = async (): Promise<string> => {
    return this.client.login(process.env.TOKEN);
  }

  registerCommands = (): void => {
    this.client.commands = new Discord.Collection();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      this.client.commands.set(command.data.name, command);
    }
  }

  deployCommands = async (): Promise<void> => {
    const restHelper = new RESTHelper();
    return restHelper.refreshAppCommands();
  }

  handleResponse = async (message: Discord.Message): Promise<Discord.Message<boolean> | void> => {
    const response = this.responsesList.find(x => x.message.toLowerCase() === message.content.toLowerCase());

    if (!response) {
      return;
    }

    let res: Promise<Discord.Message<boolean>>;
    switch(response.action) {
      case 'send':
        res = message.channel.send(response.response);
        break;
      case 'reply':
        res = message.reply(response.response);
        break;
      default:
        console.log(`Action ${response.action} not found`);
        res = message.reply('I did not understand :)');
        break;
    }

    return res;
  }

  handleTextCommand = async (message: Discord.Message, commandText: string, args: string[]): Promise<Discord.Message<boolean> | void> => {
    const command = this.textCommandsList.find(c => c.name.toLowerCase() === commandText.toLowerCase());

    if (!command) {
      console.log(`Command ${commandText} not found`);
      return;
    }

    if (command.type === 'function') {
      return this.dispatcher[`${command.callback}`](message, args, this.client.users);
    }

    return;
  }
    
}

export { Bot }