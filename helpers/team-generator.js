const { BaseHelper } = require('./baseHelper');

class TeamGenerator extends BaseHelper {

  constructor() {
    super();
  }

  generateTeams = (players, numTeams) => {
    if (players.length <= numTeams) return;

    const teams = [];

    const shuffledPlayers = this.shuffle(players);

    for (let i = 0; i < numTeams; i++) {
      teams.push({ name: `Team ${i+1}`, players: [] });
    }

    let nextTeamIndex = 0;
    for (let i = 0;i < shuffledPlayers.length; i++) {
      teams[nextTeamIndex].players.push(shuffledPlayers[i]);
      nextTeamIndex = nextTeamIndex === numTeams - 1 ? 0 : nextTeamIndex + 1;
    }

    return teams;
  }
}

module.exports = { TeamGenerator }