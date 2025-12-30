import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";

const mockFixtures = [
  {
    id: 1,
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    date: "2024-01-15",
    time: "16:30",
    venue: "Anfield",
    status: "upcoming"
  },
  {
    id: 2,
    homeTeam: "Manchester City",
    awayTeam: "Tottenham",
    date: "2024-01-16",
    time: "20:00",
    venue: "Etihad Stadium",
    status: "upcoming"
  },
  {
    id: 3,
    homeTeam: "Arsenal",
    awayTeam: "Newcastle",
    date: "2024-01-17",
    time: "14:00",
    venue: "Emirates Stadium",
    status: "upcoming"
  }
];

const FixturesCard = () => {
  return (
    <Card className="bg-elite-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Upcoming Fixtures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockFixtures.map((fixture) => (
            <div key={fixture.id} className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {fixture.time}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(fixture.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="text-center flex-1">
                  <div className="flex flex-col items-center space-y-1">
                    <img 
                      src={getTeamLogo(fixture.homeTeam)} 
                      alt={fixture.homeTeam}
                      className="w-8 h-8"
                    />
                    <p className="font-semibold text-sm">{fixture.homeTeam}</p>
                    <p className="text-xs text-muted-foreground">HOME</p>
                  </div>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-lg font-bold text-muted-foreground">VS</div>
                </div>
                
                <div className="text-center flex-1">
                  <div className="flex flex-col items-center space-y-1">
                    <img 
                      src={getTeamLogo(fixture.awayTeam)} 
                      alt={fixture.awayTeam}
                      className="w-8 h-8"
                    />
                    <p className="font-semibold text-sm">{fixture.awayTeam}</p>
                    <p className="text-xs text-muted-foreground">AWAY</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-muted-foreground flex items-center justify-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {fixture.venue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FixturesCard;