import { ITeam } from '../models/ITeam';
import { BaseHandler } from './base.handler';

class TeamGeneratorHandler extends BaseHandler {

  generateTeams = (players: string[], numTeams: number) => {
    if (players.length <= numTeams) return [];

    let teams: ITeam[] = [];
    for (let i = 0; i < numTeams; i++) {
      teams.push({ name: `Team ${i+1}`, players: [] });
    }

    const shuffledPlayers: string[] = this.shuffle(players);

    // create teams, and assign players 1 by 1 to each time
    let nextTeamIndex = 0;
    for (let i = 0;i < shuffledPlayers.length; i++) {
      teams[nextTeamIndex].players.push(shuffledPlayers[i]);
      nextTeamIndex = nextTeamIndex === numTeams - 1 ? 0 : nextTeamIndex + 1;
    }

    return teams;
  }
}

export { TeamGeneratorHandler }