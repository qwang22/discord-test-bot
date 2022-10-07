import ytdl from 'ytdl-core';
import { Message } from 'discord.js';
import {
  AudioPlayerStatus,
  VoiceConnection,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel
} from '@discordjs/voice';
import { BaseHandler } from './base.handler';

class AudioHandler extends BaseHandler {
  connection: VoiceConnection;

  connect = (message: Message) => {
    if (!message.member?.voice) return message.reply("You're not in a voice channel");

    this.connection = joinVoiceChannel({
      channelId: message.member.voice.channelId as string,
      guildId: message.member.guild.id,
      adapterCreator: message.member.guild.voiceAdapterCreator
    });
  }

  play = (link: string) => {
    const stream = ytdl(link, {
      filter: 'audioonly'
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary
    });

    const player = createAudioPlayer();

    player.play(resource);
    this.connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      this.connection.destroy();
    });

  }

}

export { AudioHandler }