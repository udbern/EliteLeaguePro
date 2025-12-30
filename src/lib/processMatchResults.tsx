// processMatchResults.ts
export interface Team {
  _id: string;
  name: string;
  logo?: string;
  shortName?: string;
}

export interface Fixture {
  _id: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
}

export interface StandingRow {
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form_last5: string;
  position?: number;
}

export const processMatchResults = (matches: Fixture[], teams: Team[]): StandingRow[] => {
  const standings = teams.map(team => ({
    _id: team._id,
    name: team.name,
    shortName: team.shortName,
    logo: team.logo,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: [] as string[],
  }));

  matches.forEach(match => {
    if (match.status !== "completed") return;

    const homeTeam = standings.find(team => team._id === match.homeTeam._id);
    const awayTeam = standings.find(team => team._id === match.awayTeam._id);

    if (!homeTeam || !awayTeam) return;

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;

    homeTeam.matchesPlayed += 1;
    awayTeam.matchesPlayed += 1;

    homeTeam.goalsFor += homeScore;
    homeTeam.goalsAgainst += awayScore;
    awayTeam.goalsFor += awayScore;
    awayTeam.goalsAgainst += homeScore;

    homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
    awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;

    if (homeScore > awayScore) {
      homeTeam.wins += 1;
      homeTeam.points += 3;
      homeTeam.form.unshift("W");
      awayTeam.losses += 1;
      awayTeam.form.unshift("L");
    } else if (homeScore < awayScore) {
      awayTeam.wins += 1;
      awayTeam.points += 3;
      awayTeam.form.unshift("W");
      homeTeam.losses += 1;
      homeTeam.form.unshift("L");
    } else {
      homeTeam.draws += 1;
      awayTeam.draws += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
      homeTeam.form.unshift("D");
      awayTeam.form.unshift("D");
    }

    homeTeam.form = homeTeam.form.slice(0, 5);
    awayTeam.form = awayTeam.form.slice(0, 5);
  });

  return standings
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
    )
    .map((team, index) => ({
      team_id: team._id,
      team_name: team.name,
      played: team.matchesPlayed,
      won: team.wins,
      drawn: team.draws,
      lost: team.losses,
      gf: team.goalsFor,
      ga: team.goalsAgainst,
      gd: team.goalDifference,
      points: team.points,
      form_last5: team.form.join(""),
      position: index + 1,
    }));
};
