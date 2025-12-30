const { createClient } = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: "dc7bo6bv",
  dataset: "production",
  apiVersion: "2025-05-23",
  token: "", // Add your token here if needed for writes
  useCdn: false,
});

async function createSeason4Competition() {
  try {
    console.log("🔍 Fetching seasons...");

    // First, find Season 4
    const seasons = await client.fetch(`*[_type == "season"] | order(name asc) {
      _id,
      name,
      isActive
    }`);

    console.log("Available seasons:", seasons);

    const season4 = seasons.find(s => s.name === "Season 4" || s.name.includes("4"));
    if (!season4) {
      console.log("❌ Season 4 not found. Please create Season 4 first in Sanity Studio.");
      return;
    }

    console.log("✅ Found Season 4:", season4);

    // Check if competition already exists for Season 4
    const existingCompetitions = await client.fetch(
      `*[_type == "competition" && $seasonId in seasons[]._ref]`,
      { seasonId: season4._id }
    );

    if (existingCompetitions.length > 0) {
      console.log("✅ Competition already exists for Season 4:", existingCompetitions);
      return;
    }

    console.log("📝 Creating Premier League competition for Season 4...");

    // Create a basic Premier League competition
    const competition = {
      _type: 'competition',
      name: 'Premier League 2024',
      type: 'league',
      format: 'round-robin',
      isActive: true,
      seasons: [{
        _type: 'reference',
        _ref: season4._id
      }],
      description: 'English Premier League for Season 4'
    };

    const result = await client.create(competition);
    console.log("✅ Competition created successfully:", result);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createSeason4Competition();
