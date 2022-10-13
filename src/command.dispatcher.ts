import * as Discord from 'discord.js';
import { AudioHandler } from './command-handlers/audio.handler';
import { PickerHandler } from "./command-handlers/picker.handler";
import { SecretSantaHandler } from "./command-handlers/secret-santa.handler";
import { TeamGeneratorHandler } from "./command-handlers/team-generator.handler";

class CommandDispatcher {

  pickerHandler: PickerHandler;
  secretSantaHandler: SecretSantaHandler;
  teamGeneratorHandler: TeamGeneratorHandler;
  audioHandler: AudioHandler;

  eventsAttached: boolean;

  constructor() {
    this.pickerHandler = new PickerHandler();
    this.secretSantaHandler = new SecretSantaHandler();
    this.teamGeneratorHandler = new TeamGeneratorHandler();
    this.audioHandler = new AudioHandler();
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

  playAudio = async (message: Discord.Message, args: string[]) => {
    if (!this.eventsAttached) this.attachEvents();
  
    this.audioHandler.connect(message);
    const position = this.audioHandler.play(args[0], message);

    if (position > 0 && message.embeds?.length) {
      const embed = new Discord.EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Queued')
        .setURL(args[0])
        .setDescription(message.embeds[0].title)
        .setThumbnail(message.embeds[0].thumbnail!.url)
        .setFooter({ text: `In position #${position}` });

      return message.channel.send({ embeds: [embed] });
    } else return;

  }

  showPlaylist = (message: Discord.Message) => {
    const list = this.audioHandler.queue.map((song, i) => {
      return {
        song: song.title,
        position: i.toString(),
        requestedBy: song.message.author.tag
      }
    });

    let response = `Current playlist:\n\nPlaying now: ${list[0].song} (requested by ${list[0].requestedBy}).\n\n`;
    list.shift();

    if (list.length) response += 'Upcoming:\n\n';

    list.forEach(item => {
      response += `${item.position}. ${item.song} requested by ${item.requestedBy}.\n`;
    });
    return message.channel.send(response);
  }

  attachEvents = () => {
    this.eventsAttached = true;
    this.audioHandler.on('playing', (data) => {
      console.log('playing event fired', data.link);

      const message = data.message;
      const embed = new Discord.EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Now Playing')
          .setURL(data.link)
          .setDescription(message.embeds[0].title)
          .setThumbnail(message.embeds[0].thumbnail!.url)
          .setFooter({ text: `Requested by ${message.author.tag}` });

    return message.channel.send({ embeds: [embed] });
    });
  }
}

export { CommandDispatcher }