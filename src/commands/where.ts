import { InteractionResponse, SlashCommandBuilder } from 'discord.js';
import path from 'path';
import fs from 'fs';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('where')
		.setDescription('Where...')
		.addStringOption(option =>
			option.setName('user')
        .setDescription('The user to where.')
        .addChoices(
          { name: 'alvin', value: 'alvin' },
          { name: 'desiree', value: 'desiree' },
          { name: 'qian', value: 'qian' },
          { name: 'blake', value: 'blake' },
          { name: 'blaze', value: 'blaze' },
          { name: 'connor', value: 'connor' },
          { name: 'poop', value: 'poop' }
        )
				.setRequired(true)),
	
	execute: async (interaction): Promise<InteractionResponse<boolean>>  => {
    const user: string = interaction.options.getString('user');
    const imagesPath = path.join(__dirname, '..', 'assets', 'images');
    const whereImgFiles = fs.readdirSync(imagesPath).filter(file => file.startsWith('where') && file.endsWith('.png'));
    const targetFile = whereImgFiles.find(x => x === `where_${user}.png`);

    if (!targetFile) return interaction.reply(`An image does not exist for user: ${user}`);

    const imagePath = `./src/assets/images/${targetFile}`;

    return interaction.reply({ files: [imagePath] });
	}
}
