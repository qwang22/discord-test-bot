import { BaseHandler } from './base.handler';

class PickerHandler extends BaseHandler {

  pick = (items: string[]): string => {
    const shuffledGames = this.shuffle(items);
    return shuffledGames[this.getRandomNumber(0, shuffledGames.length-1)]; 
  }
}

export { PickerHandler }