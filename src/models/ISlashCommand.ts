import { SlashCommandBuilder } from "discord.js";

interface ISlashCommand {
  data: SlashCommandBuilder;
  execute: (args?: any[]) => any;
}

export { ISlashCommand }