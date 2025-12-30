import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/utils/teamLogos";

const mockStandings = [
  { position: 1, team: "Manchester City", played: 12, won: 10, drawn: 1, lost: 1, gf: 32, ga: 8, gd: 24, points: 31, form: ["W", "W", "W", "D", "W"] },
  { position: 2, team: "Arsenal", played: 12, won: 9, drawn: 2, lost: 1, gf: 28, ga: 12, gd: 16, points: 29, form: ["W", "L", "W", "W", "W"] },
  { position: 3, team: "Liverpool", played: 12, won: 8, drawn: 3, lost: 1, gf: 26, ga: 10, gd: 16, points: 27, form: ["W", "W", "D", "W", "D"] },
  { position: 4, team: "Manchester United", played: 12, won: 7, drawn: 2, lost: 3, gf: 21, ga: 15, gd: 6, points: 23, form: ["W", "L", "W", "W", "L"] },
  { position: 5, team: "Chelsea", played: 12, won: 6, drawn: 3, lost: 3, gf: 19, ga: 14, gd: 5, points: 21, form: ["D", "W", "L", "W", "D"] },
];

const getFormIcon = (result: string) => {
  switch (result) {
    case "W":
      return <TrendingUp className="w-3 h-3 text-primary" />;
    case "L":
      return <TrendingDown className="w-3 h-3 text-destructive" />;
    case "D":
      return <Minus className="w-3 h-3 text-muted-foreground" />;
    default:
      return null;
  }
};

const getPositionColor = (position: number) => {
  if (position <= 4) return "bg-primary/20 text-primary border-primary/30";
  if (position <= 6) return "bg-accent/20 text-accent border-accent/30";
  if (position >= 18) return "bg-destructive/20 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground";
};

const StandingsTable = () => {
  return (
    <Card className="bg-elite-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold">League Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2">Pos</th>
                <th className="text-left py-3 px-2">Team</th>
                <th className="text-center py-3 px-2 hidden sm:table-cell">P</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">W</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">D</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">L</th>
                <th className="text-center py-3 px-2 hidden lg:table-cell">GF</th>
                <th className="text-center py-3 px-2 hidden lg:table-cell">GA</th>
                <th className="text-center py-3 px-2">GD</th>
                <th className="text-center py-3 px-2">Pts</th>
                <th className="text-center py-3 px-2">Form</th>
              </tr>
            </thead>
            <tbody>
              {mockStandings.map((team) => (
                <tr key={team.position} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={getPositionColor(team.position)}>
                      {team.position}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 font-medium">
                    <Link 
                      to={`/team/${team.team.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center space-x-3 hover:text-primary transition-colors"
                    >
                      <img 
                        src={getTeamLogo(team.team)} 
                        alt={team.team}
                        className="w-6 h-6"
                      />
                      <span>{team.team}</span>
                    </Link>
                  </td>
                  <td className="text-center py-3 px-2 hidden sm:table-cell">{team.played}</td>
                  <td className="text-center py-3 px-2 hidden md:table-cell">{team.won}</td>
                  <td className="text-center py-3 px-2 hidden md:table-cell">{team.drawn}</td>
                  <td className="text-center py-3 px-2 hidden md:table-cell">{team.lost}</td>
                  <td className="text-center py-3 px-2 hidden lg:table-cell">{team.gf}</td>
                  <td className="text-center py-3 px-2 hidden lg:table-cell">{team.ga}</td>
                  <td className="text-center py-3 px-2">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                  <td className="text-center py-3 px-2 font-bold text-primary">{team.points}</td>
                  <td className="py-3 px-2">
                    <div className="flex justify-center space-x-1">
                      {team.form.map((result, index) => (
                        <div key={index} className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          {getFormIcon(result)}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandingsTable;