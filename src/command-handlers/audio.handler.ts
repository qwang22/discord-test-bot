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
  AudioResource,
  VoiceConnectionStatus
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

    if (!this.connection || this.connection?.state.status === VoiceConnectionStatus.Destroyed) {
      this.connection = joinVoiceChannel({
        channelId: message.member.voice.channelId as string,
        guildId: message.member.guild.id,
        adapterCreator: message.member.guild.voiceAdapterCreator
      });
    }

    if (this.player) {
      this.connection.subscribe(this.player);
      return;
    }

    this.player = createAudioPlayer();

    this.connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, (_oldState, _newState) => {
      this.queue.shift();

      console.log('Current queue', this.queue);
  
      if (this.queue.length) {
        this.player.play(this.createResource(this.queue[0]));
      }
  
      setTimeout(() => {
        if (this.state === AudioPlayerStatus.Idle && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
          console.log('Idle time of 60s reached.  Destroying connection...')
          this.connection.destroy();
        }
      }, 60000);
    });
  
    this.player.on('stateChange', (oldState, newState) => {
      console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        
      this.state = newState.status;
    });

  }

  play = (link: string): number => {

    this.queue = [...this.queue, link];
    const next = this.queue[0];

    try {
      const resource = this.createResource(next);
  
      if (this.state !== AudioPlayerStatus.Playing) {
        this.player.play(resource);
      }

    } catch(err) {
      console.error(`Error during audio playback`, err);
    }

    return this.queue.indexOf(link);

  }

  createResource = (link: string): AudioResource => {
    const stream = ytdl(link, {
      filter: "audioonly",
      highWaterMark: 1 << 62,
      liveBuffer: 1 << 62,
      dlChunkSize: 0,
      quality: "lowestaudio",
    });

    return createAudioResource(stream, {
      inputType: StreamType.Arbitrary
    });
  }

}

export { AudioHandler }