import { REST, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder, Snowflake } from "discord.js";
import path from 'path';
import fs from 'fs';
import { ISlashCommand } from "./models/ISlashCommand";

class RESTHelper {
  refreshAppCommands = async (guildId?: Snowflake) => {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
	    const filePath = path.join(commandsPath, file);
	    const command: ISlashCommand = require(filePath);
	    commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: process.env.REST_VERSION }).setToken(process.env.TOKEN as string);

    try {
      console.log('Started refreshing application (/) commands.');

      if (guildId) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID as string, guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
      } else {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), { body: commands });
      }
      
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
    
  }
    
}

export { RESTHelper }