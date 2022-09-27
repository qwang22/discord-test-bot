const { BaseHelper } = require('./baseHelper');

class GamePicker extends BaseHelper {

  games; // array of strings

  constructor(games) {
    super();
    this.games = games;
  }

  pickGame = () => {
    const shuffledGames = this.shuffle(this.games);
    return shuffledGames[this.getRandomNumber(0, shuffledGames.length-1)];
  }
}

module.exports = { GamePicker }