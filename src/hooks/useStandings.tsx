import { useEffect, useState } from "react";
import fetchStandings from "@/lib/fetchStandings";

export interface Standing {
  _id: string;
  name: string;
  shortName: string;
  logo?: string | null;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
}

export const useStandings = (seasonId: string, competitionId: string) => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStandings = async () => {
      setLoading(true);
      try {
        const data = await fetchStandings(seasonId, competitionId);
        setStandings(data);
      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, [seasonId, competitionId]);

  return { standings, loading };
};
