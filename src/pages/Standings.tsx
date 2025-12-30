import React from "react";
import StandingsTableFull from "@/components/StandingsTableFull";
import StandingsTableShort from "@/components/StandingsTableShort";
import StandingsForm from "@/components/StandingsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";

export default function Standings() {
  const { selectedSeason } = useSeason();
  const { selectedCompetition, loading: competitionLoading } = useCompetition();

  if (!selectedSeason) return <p className="text-center py-10">Select a season</p>;
  if (competitionLoading) return <p className="text-center py-10">Loading competitions...</p>;
  if (!selectedCompetition) return <p className="text-center py-10">No competition available for this season</p>;

  const seasonId = selectedSeason._id;
  const competitionId = selectedCompetition._id;

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">League Standings</h1>
          <p className="text-muted-foreground">Based on completed fixtures</p>
        </div>

        <Tabs defaultValue="full" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="full">Full</TabsTrigger>
            <TabsTrigger value="short">Short</TabsTrigger>
            <TabsTrigger value="form">Form</TabsTrigger>
          </TabsList>

          <TabsContent value="full">
            <StandingsTableFull seasonId={seasonId} competitionId={competitionId} />
          </TabsContent>

          <TabsContent value="short">
            <StandingsTableShort seasonId={seasonId} competitionId={competitionId} />
          </TabsContent>

          <TabsContent value="form">
            <StandingsForm seasonId={seasonId} competitionId={competitionId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}