import * as Discord from 'discord.js';
import { PickerHandler } from "./command-handlers/picker.handler";
import { SecretSantaHandler } from "./command-handlers/secret-santa.handler";
import { TeamGeneratorHandler } from "./command-handlers/team-generator.handler";

class CommandDispatcher {

  pickerHandler: PickerHandler;
  secretSantaHandler: SecretSantaHandler;
  teamGeneratorHandler: TeamGeneratorHandler;

  constructor() {
    this.pickerHandler = new PickerHandler();
    this.secretSantaHandler = new SecretSantaHandler();
    this.teamGeneratorHandler = new TeamGeneratorHandler();
  }

  makeTeams = (message: Discord.Message, args: string[]): Promise<Discord.Message<boolean>> => {
    const teamGenerator = new TeamGeneratorHandler();
    const teams = teamGenerator.generateTeams(args, 2);

    const responseArr = teams.map(t => {
      return `${t.name}: ${t.players.join(', ')}`;
    });

    return message.channel.send(responseArr?.join('\n'));
  }

  pick = (message: Discord.Message, args: string[]): Promise<Discord.Message<boolean>> => {
    const picker = new PickerHandler();
    const game = picker.pick(args);

    return message.channel.send(`Result: ${game}`);
  }

  secretSanta = async (message: Discord.Message, args: string[], users: Discord.UserManager): Promise<Discord.Message<boolean>> => {
    const ssHelper = new SecretSantaHandler();
    const results = ssHelper.assignSecretSanta(args);
    
    for (const r of results) {
      const santa = await users.fetch(r.santa.substring(2, r.santa.length-1));
      const recipient = await users.fetch(r.recipient.substring(2, r.recipient.length-1));
      santa.send(`You are ${recipient.username}'s secret santa!`);
    }

    return message.channel.send('Done! Check your DMs for your result :)');
  }
}

export { CommandDispatcher }