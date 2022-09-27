const { BaseHelper } = require('./baseHelper');

class SecretSantaHelper extends BaseHelper {

  input; // array of strings
  results; // [{ santa: '', recipient: '' }]

  constructor(input) {
    super();
    this.results = [];
    this.input = input;
  }

  assignSecretSantas = () => {
    const shuffledNames = this.shuffle([...this.input]);

    const drawings = shuffledNames.map((name, i) => {
      return {
        santa: name,
        recipient: shuffledNames[i + 1] || shuffledNames[0],
      }
    });

    return drawings;
  }

}

module.exports = { SecretSantaHelper }