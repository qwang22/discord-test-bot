import dotenv from 'dotenv';
import { Bot } from './bot';

class Main {
  bot: Bot;

  init = () => {
    dotenv.config();
    new Bot().up();
  }

}
new Main().init();