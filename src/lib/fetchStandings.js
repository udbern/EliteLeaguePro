import sanityClient from "./sanityClient";
import processMatchResults from "./processMatchResults";

const fetchStandings = async (seasonId, competitionId) => {
  try {
    // First, try to get stored standings from the database
    const storedStandings = await sanityClient.fetch(
      `*[_type == "standing" && season._ref == $seasonId && competition._ref == $competitionId] | order(dateSaved desc)[0]`,
      { seasonId, competitionId }
    );

    if (storedStandings && storedStandings.teams && storedStandings.teams.length > 0) {
      // Return stored standings with team details
      const teamIds = storedStandings.teams.map(team => team.team._ref);
      const teams = await sanityClient.fetch(
        `*[_type == "team" && _id in $teamIds]`,
        { teamIds }
      );

      return storedStandings.teams.map(teamStanding => {
        const team = teams.find(t => t._id === teamStanding.team._ref);
        return {
          _id: team?._id || teamStanding.team._ref,
          name: team?.name || 'Unknown Team',
          shortName: team?.shortName || 'UNK',
          logo: team?.logo,
          position: 0, // Will be calculated below
          played: teamStanding.played,
          won: teamStanding.wins,
          drawn: teamStanding.draws,
          lost: teamStanding.losses,
          goalsFor: teamStanding.goalsFor,
          goalsAgainst: teamStanding.goalsAgainst,
          goalDifference: teamStanding.goalDifference,
          points: teamStanding.points,
          form: [] // Stored standings don't have form data
        };
      }).sort((a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor
      ).map((team, index) => ({
        ...team,
        position: index + 1,
      }));
    }

    // If no stored standings, calculate from matches
    const matches = await sanityClient.fetch(
      `*[_type == "fixture" && season._ref == $seasonId && competition._ref == $competitionId]`,
      { seasonId, competitionId }
    );
    
    // Get teams that participated in this season and competition (from matches)
    const teamIds = new Set();
    matches.forEach(match => {
      if (match.homeTeam?._ref) teamIds.add(match.homeTeam._ref);
      if (match.awayTeam?._ref) teamIds.add(match.awayTeam._ref);
    });

    const teams = await sanityClient.fetch(
      `*[_type == "team" && _id in $teamIds]`,
      { teamIds: Array.from(teamIds) }
    );
    
    return processMatchResults(matches, teams);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return [];
  }
};

export default fetchStandings;