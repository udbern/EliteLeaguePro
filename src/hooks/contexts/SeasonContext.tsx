"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import  sanityClient  from "@/lib/sanityClient";

type Season = {
  seasonId: any;
  competitionId: any;
  _id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

type SeasonContextType = {
  selectedSeason: Season | null;
  setSelectedSeason: React.Dispatch<React.SetStateAction<Season | null>>;
  seasons: Season[];
};

export const SeasonContext = createContext<SeasonContextType | null>(null);

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) throw new Error("useSeason must be used within a SeasonProvider");
  return context;
};

export const SeasonProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch seasons from Sanity
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const fetchedSeasons: Season[] = await sanityClient.fetch(
          `*[_type == "season"] | order(startDate desc) {
            _id,
            name,
            isActive,
            startDate,
            endDate,
            "seasonId": _id
          }`
        );

        setSeasons(fetchedSeasons);

        // Clear old localStorage data that might not have seasonId/competitionId
        const storedSeason = localStorage.getItem("selectedSeason");
        if (storedSeason) {
          const parsedSeason = JSON.parse(storedSeason);
          // Find the matching season from fetched data to get complete data
          const matchingSeason = fetchedSeasons.find(s => s._id === parsedSeason._id);
          if (matchingSeason) {
            setSelectedSeason(matchingSeason);
            return;
          }
        }

        // Fallback to active season
        const activeSeason = fetchedSeasons.find(s => s.isActive);
        setSelectedSeason(activeSeason || fetchedSeasons[0] || null);
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    fetchSeasons();
    setIsMounted(true);
  }, []);

  // Persist selected season to localStorage
  useEffect(() => {
    if (selectedSeason) {
      localStorage.setItem("selectedSeason", JSON.stringify(selectedSeason));
    }
  }, [selectedSeason]);

  if (!isMounted) return null;

  return (
    <SeasonContext.Provider value={{ selectedSeason, setSelectedSeason, seasons }}>
      {children}
    </SeasonContext.Provider>
  );
};
