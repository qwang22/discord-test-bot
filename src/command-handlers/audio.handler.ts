import ytdl from 'ytdl-core';
import { Message } from 'discord.js';
import {
  AudioPlayerStatus,
  VoiceConnection,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayer
} from '@discordjs/voice';
import { BaseHandler } from './base.handler';

class AudioHandler extends BaseHandler {
  connection: VoiceConnection;
  player: AudioPlayer;

  constructor() {
    super();
  }

  connect = (message: Message) => {
    if (!message.member?.voice?.channelId) return message.reply("You're not in a voice channel!");

    this.connection = joinVoiceChannel({
      channelId: message.member.voice.channelId as string,
      guildId: message.member.guild.id,
      adapterCreator: message.member.guild.voiceAdapterCreator
    });
  }

  play = (link: string) => {

    try {
      const stream = ytdl(link, {
        filter: 'audioonly'
      });
  
      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
      });
  
      this.player = createAudioPlayer();
  
      this.player.play(resource);
  
      this.connection.subscribe(this.player);
    } catch(err) {
      console.error(`Error during audio playback`, err);
    }

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.connection.destroy();
    });

    this.player.on('stateChange', (oldState, newState) => {
      console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });

  }

}

export { AudioHandler }