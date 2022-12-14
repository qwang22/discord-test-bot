class BaseHandler {

  shuffle = (array: any[]): any[] => {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  // range inclusive
  getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export { BaseHandler }