import sanityClient from "@/lib/sanityClient";

// -----------------------------
// TYPES
// -----------------------------
export interface Team {
  _id: string;
  name: string;
  logo?: {
    asset?: {
      url?: string;
    };
  };
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
  team_logo?: string | null; // 👈 ADDED
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

// -----------------------------
// FETCH FIXTURES
// -----------------------------
export async function fetchFixtures(
  seasonId: string,
  competitionId: string
): Promise<Fixture[]> {
  if (!seasonId || !competitionId) return [];

  try {
    const fixtures: Fixture[] = await sanityClient.fetch(
      `*[_type == "fixture" 
        && season._ref == $seasonId 
        && competition._ref == $competitionId]{
          _id,
          status,
          homeTeam->{_id, name, logo{asset->{url}}},
          awayTeam->{_id, name, logo{asset->{url}}},
          homeScore,
          awayScore
        }`,
      {
        seasonId: String(seasonId),
        competitionId: String(competitionId),
      }
    );

    return fixtures.filter((f) => f.status === "completed");
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return [];
  }
}

// -----------------------------
// CALCULATE STANDINGS
// -----------------------------
export function calculateStandings(fixtures: Fixture[]): StandingRow[] {
  const teamsMap: Record<string, StandingRow> = {};

  fixtures.forEach((f) => {
    const home = f.homeTeam;
    const away = f.awayTeam;

    const homeScore = f.homeScore ?? 0;
    const awayScore = f.awayScore ?? 0;

    if (!teamsMap[home._id]) {
      teamsMap[home._id] = {
        team_id: home._id,
        team_name: home.name,
        team_logo: home.logo?.asset?.url || null, // 👈 LOGO FETCHED
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        form_last5: "",
      };
    }

    if (!teamsMap[away._id]) {
      teamsMap[away._id] = {
        team_id: away._id,
        team_name: away.name,
        team_logo: away.logo?.asset?.url || null, // 👈 LOGO FETCHED
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
        form_last5: "",
      };
    }

    const homeEntry = teamsMap[home._id];
    const awayEntry = teamsMap[away._id];

    // PLAYED
    homeEntry.played += 1;
    awayEntry.played += 1;

    // GOALS
    homeEntry.gf += homeScore;
    homeEntry.ga += awayScore;

    awayEntry.gf += awayScore;
    awayEntry.ga += homeScore;

    // WIN / DRAW / LOSS + FORM
    if (homeScore > awayScore) {
      homeEntry.won += 1;
      homeEntry.points += 3;
      awayEntry.lost += 1;

      homeEntry.form_last5 = "W" + homeEntry.form_last5;
      awayEntry.form_last5 = "L" + awayEntry.form_last5;
    } else if (homeScore < awayScore) {
      awayEntry.won += 1;
      awayEntry.points += 3;
      homeEntry.lost += 1;

      awayEntry.form_last5 = "W" + awayEntry.form_last5;
      homeEntry.form_last5 = "L" + homeEntry.form_last5;
    } else {
      homeEntry.drawn += 1;
      awayEntry.drawn += 1;

      homeEntry.points += 1;
      awayEntry.points += 1;

      homeEntry.form_last5 = "D" + homeEntry.form_last5;
      awayEntry.form_last5 = "D" + awayEntry.form_last5;
    }

    // KEEP ONLY LAST 5
    homeEntry.form_last5 = homeEntry.form_last5.slice(0, 5);
    awayEntry.form_last5 = awayEntry.form_last5.slice(0, 5);
  });

  // FINAL TABLE CALC
  const standings = Object.values(teamsMap).map((team) => ({
    ...team,
    gd: team.gf - team.ga,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  standings.forEach((team, index) => {
    team.position = index + 1;
  });

  return standings;
}
