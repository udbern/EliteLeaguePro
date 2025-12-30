import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamLogo } from "@/utils/teamLogos";
import { Link } from "react-router-dom";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";
import client, { urlFor } from "@/lib/sanityClient";

const Teams = () => {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedSeason) {
        setTeams([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch teams for the selected season
        const teamsData = await client.fetch(
          `*[_type == "team" && $seasonId in seasons[]._ref]{
            _id,
            name,
            shortName,
            logo,
            seasons[]->{
              _id,
              name
            }
          }`,
          { seasonId: selectedSeason._id }
        );

        // Map to the expected format
        const mappedTeams = teamsData.map(team => ({
          id: team._id,
          name: team.name,
          logo_url: team.logo,
          short_name: team.shortName,
          seasons: team.seasons || []
        })).sort((a, b) => a.name.localeCompare(b.name));

        setTeams(mappedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedSeason]);

  const slugifyName = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">
            {teams.length} {teams.length === 1 ? "team" : "teams"}
          </p>
        </div>
        
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No teams found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team) => (
              <Link 
                key={team.id} 
                to={`/team/${slugifyName(team.name)}`}
                className="block"
              >
                <Card className="bg-elite-card border-border/50 hover:bg-muted/30 transition-all duration-300 hover:scale-105 hover:shadow-lg h-48">
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <img
                        src={team.logo_url ? urlFor(team.logo_url).url() : getTeamLogo(team.name)}
                        alt={team.name}
                        className="w-15 h-15 object-contain rounded-full"
                        onError={(e) => {
                          e.target.src = getTeamLogo(team.name);
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-bold">{team.name}</h3>
                        {team.short_name && (
                          <p className="text-sm text-muted-foreground mt-1">{team.short_name}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;