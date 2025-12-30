import { useEffect, useState } from "react";
import { fetchFixtures, calculateStandings, StandingRow } from "@/lib/standingsHelpers";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/utils/teamLogos";

interface Props {
  seasonId: string;
  competitionId: string;
}

export default function StandingsForm({ seasonId, competitionId }: Props) {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId || !competitionId) return;

    async function load() {
      setLoading(true);
      const fixtures = await fetchFixtures(seasonId, competitionId);
      const calculated = calculateStandings(fixtures);
      setStandings(calculated);
      setLoading(false);
    }

    load();
  }, [seasonId, competitionId]);

  if (loading)
    return <p className="text-center py-6 text-muted-foreground">Loading standings...</p>;
  if (!standings.length)
    return <p className="text-center py-6 text-muted-foreground">No completed fixtures yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-elite-card">
      <table className="min-w-full text-sm text-muted-foreground">
        <thead className="uppercase font-semibold">
          <tr>
            <th className="p-3 text-center">Pos</th>
            <th className="p-3 text-left">Team</th>
            <th className="p-3 text-center">Form</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((team) => (
            <tr
              key={team.team_id}
              className="border-t border-border/30 hover:bg-muted/30 transition-colors"
            >
              <td className="p-3 text-center font-bold text-primary">
                {team.position}
              </td>

              {/* TEAM NAME + LOGO */}
              <td className="p-3">
                <Link
                  to={`/team/${team.team_name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={team.team_logo || getTeamLogo(team.team_name)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getTeamLogo(team.team_name);
                    }}
                    alt={team.team_name}
                    className="w-6 h-6 object-contain rounded-sm"
                  />
                  <span className="font-semibold">{team.team_name}</span>
                </Link>
              </td>

              <td className="p-3 text-center font-bold">
                <div className="flex justify-center space-x-1">
                  {(team.form_last5 || "").split("").map((res, i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 md:w-6 md:h-6  flex items-center justify-center rounded-full text-white text-sm ${
                        res === "W" ? "bg-green-600" : res === "D" ? "bg-yellow-500" : "bg-red-600"
                      }`}
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
