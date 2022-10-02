import { CommandInteraction, InteractionResponse, SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beep')
		.setDescription('Beep!'),

	execute: async (interaction: CommandInteraction): Promise<InteractionResponse<boolean>> => {
		return interaction.reply('Boop!');
	}
};