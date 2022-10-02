import { InteractionResponse, SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with your input!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true)),
	
	execute: async (interaction): Promise<InteractionResponse<boolean>>  => {
		const input: string = interaction.options.getString('input');
		return interaction.reply(`You said ${input}!`)
	}
}