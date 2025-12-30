import client from "../lib/sanityClient.js";

async function checkAndCreateCompetitions() {
  try {
    // First, let's check if there are any seasons
    const seasons = await client.fetch(`*[_type == "season"]`);
    console.log("Found seasons:", seasons.length);
    
    if (seasons.length === 0) {
      console.log("No seasons found. Please create a season first.");
      return;
    }

    // Check for existing competitions
    const competitions = await client.fetch(`*[_type == "competition"]`);
    console.log("Found competitions:", competitions.length);
    
    if (competitions.length === 0) {
      console.log("No competitions found. Creating sample competitions...");
      
      // Create sample competitions for each season
      for (const season of seasons) {
        const competitionData = [
          {
            name: "Premier League",
            type: "league",
            season: { _type: "reference", _ref: season._id },
            isActive: true,
            format: "round-robin",
            description: "The main league competition"
          },
          {
            name: "FA Cup",
            type: "cup",
            season: { _type: "reference", _ref: season._id },
            isActive: true,
            format: "knockout",
            rounds: ["Round 1", "Round 2", "Quarter Finals", "Semi Finals", "Final"],
            description: "The main cup competition"
          },
          {
            name: "Community Shield",
            type: "championship",
            season: { _type: "reference", _ref: season._id },
            isActive: true,
            format: "knockout",
            rounds: ["Final"],
            description: "Season opener championship"
          },
          {
            name: "Pre-Season Friendlies",
            type: "friendly",
            season: { _type: "reference", _ref: season._id },
            isActive: true,
            format: "round-robin",
            description: "Pre-season friendly matches"
          }
        ];

        for (const comp of competitionData) {
          const created = await client.create({
            _type: "competition",
            ...comp
          });
          console.log(`Created competition: ${comp.name} for season ${season.name}`);
        }
      }
    } else {
      console.log("Existing competitions:");
      competitions.forEach(comp => {
        console.log(`- ${comp.name} (${comp.type}) for season ${comp.season?.name || 'Unknown'}`);
      });
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

checkAndCreateCompetitions(); 