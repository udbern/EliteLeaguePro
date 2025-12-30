import { useEffect, useState } from "react";
import {
  fetchFixtures,
  calculateStandings,
  StandingRow,
} from "@/lib/standingsHelpers";
import { getTeamLogo } from "@/utils/teamLogos";
import { Link } from "react-router-dom";

interface Props {
  seasonId?: string;
  competitionId?: string;
}

export default function StandingsTableFull({ seasonId, competitionId }: Props) {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const fixtures = await fetchFixtures(seasonId, competitionId);

      // standings now include team logo
      const calculated = calculateStandings(fixtures);

      setStandings(calculated);
      setLoading(false);
    }

    load();
  }, [seasonId, competitionId]);

  if (loading)
    return <p className="text-center py-6">Loading standings...</p>;

  if (!standings.length)
    return <p className="text-center py-6">No completed fixtures yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 bg-elite-card">
      <table className="min-w-full text-sm text-muted-foreground">
        <thead className="uppercase font-semibold">
          <tr>
            <th className="p-3 text-center">Pos</th>
            <th className="p-3 text-left">Team</th>
            <th className="p-3 text-center">P</th>
            <th className="p-3 text-center">W</th>
            <th className="p-3 text-center">D</th>
            <th className="p-3 text-center">L</th>
            <th className="p-3 text-center">GF</th>
            <th className="p-3 text-center">GA</th>
            <th className="p-3 text-center">Pts</th>
            <th className="p-3 text-center">Form</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((team) => (
            <tr
              key={team.team_id}
              className="border-t border-border/30 hover:bg-muted/30 transition-colors"
            >
              <td className="p-3 text-center">{team.position}</td>

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

              <td className="p-3 text-center">{team.played}</td>
              <td className="p-3 text-center">{team.won}</td>
              <td className="p-3 text-center">{team.drawn}</td>
              <td className="p-3 text-center">{team.lost}</td>
              <td className="p-3 text-center">{team.gf}</td>
              <td className="p-3 text-center">{team.ga}</td>

              <td className="p-3 text-center font-bold text-primary">
                {team.points}
              </td>

              <td className="p-3 text-center font-bold">
                {team.form_last5}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
