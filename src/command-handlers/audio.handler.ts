import ytdl from 'ytdl-core';
import { Message } from 'discord.js';
import {
  AudioPlayerStatus,
  VoiceConnection,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayer,
} from '@discordjs/voice';
import { BaseHandler } from './base.handler';

class AudioHandler extends BaseHandler {
  connection: VoiceConnection;
  player: AudioPlayer;
  state: AudioPlayerStatus;
  queue: string[];

  constructor() {
    super();
    this.queue = [];
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
        filter: "audioonly",
        highWaterMark: 1 << 62,
        liveBuffer: 1 << 62,
        dlChunkSize: 0,
        quality: "lowestaudio",
      });
  
      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary
      });
  
      if (!this.player) {
        this.player = createAudioPlayer();
      }
  
      this.player.play(resource);
  
      this.connection.subscribe(this.player);

      this.player.on(AudioPlayerStatus.Idle, (_oldState, _newState) => {
        setTimeout(() => {
          if (this.state === AudioPlayerStatus.Idle && this.connection) {
            this.connection.destroy();
          }
        }, 60000);
      });
  
      this.player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        
        this.state = newState.status;
      });

    } catch(err) {
      console.error(`Error during audio playback`, err);
    }

  }

}

export { AudioHandler }