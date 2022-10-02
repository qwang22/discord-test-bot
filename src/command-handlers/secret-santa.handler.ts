import { ISecretSantaResult } from "../models/ISecretSantaResult";
import { BaseHandler } from "./base.handler";

class SecretSantaHandler extends BaseHandler {

  assignSecretSanta = (people: string[]): ISecretSantaResult[] => {
    const shuffledNames: string[] = this.shuffle(people);

    const results: ISecretSantaResult[] = shuffledNames.map((name, i) => {
      return {
        santa: name,
        recipient: shuffledNames[i + 1] || shuffledNames[0],
      }
    });

    return results;
  }
}

export { SecretSantaHandler }