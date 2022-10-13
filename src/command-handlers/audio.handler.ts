import ytdl from 'ytdl-core';
import { Message, Snowflake, User } from 'discord.js';
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
  queue: { link: string, message: Message, title: string }[];

  _events: any;

  constructor() {
    super();
    this.queue = [];
    this._events = {};
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
    console.log('creating audio player...')

    this.connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, (_oldState, _newState) => {
      this.queue.shift();
  
      if (this.queue.length) {
        this.player.play(this.createResource(this.queue[0].link));
      }
  
      setTimeout(() => {
        if (this.state === AudioPlayerStatus.Idle && this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
          console.log('Idle time of 60s reached.  Destroying connection...')
          this.connection.destroy();
        }
      }, 60000);
    });

    this.player.on(AudioPlayerStatus.Playing, () => {
      // send now playing message
      this.emit('playing', this.queue[0]);
    });
  
    this.player.on('stateChange', (oldState, newState) => {
      console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        
      this.state = newState.status;
    });

  }

  play = (link: string, message: Message): number => {

    this.queue = [
      ...this.queue,
      { link, message, title: message.embeds[0]?.title ?? `I\'m still learning and couldn\'t get the title this time, but this was the URL: ${link}` }];

    if (!message.embeds[0]) {
      console.log(`EMBED ISSUE: ${message}`)
    }
    if (this.state && this.state === AudioPlayerStatus.Playing) return this.queue.length-1;

    try {
      // const next = this.queue[0];
      const next = this.queue[0].link;
      const resource = this.createResource(next);
      this.player.play(resource);
    } catch(err) {
      console.error(`Error during audio playback`, err);
      return -1;
    }

    return this.queue.findIndex(x => x.link === link);
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

  /***** testing event emitter ******/

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
    }

    const filterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  emit(name, data) {
    if (!this._events[name]) {
      throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
    }

    const fireCallbacks = (callback) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }

}

export { AudioHandler }