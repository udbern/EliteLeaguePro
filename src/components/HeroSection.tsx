import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-background via-elite-dark to-elite-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Premier
            </span>{" "}
            <span className="text-foreground">League</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            The ultimate destination for elite football competition
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-elite-card to-elite-muted border-border/50 shadow-[0_0_30px_-10px_hsl(var(--elite-green)_/_0.3)]">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <Badge variant="secondary" className="mb-3 bg-primary/20 text-primary border-primary/30">
                  <Clock className="w-3 h-3 mr-1" />
                  LIVE NOW
                </Badge>
                <h3 className="text-2xl font-bold mb-2">Manchester United vs Arsenal</h3>
                <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  Old Trafford, Manchester
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  <span className="text-primary">2</span>
                  <span className="text-muted-foreground mx-4">-</span>
                  <span className="text-accent">1</span>
                </div>
                <p className="text-muted-foreground">75'</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;