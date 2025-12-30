"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import client from "@/lib/sanityClient";

const CompetitionContext = createContext();

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error("useCompetition must be used within a CompetitionProvider");
  }
  return context;
};

export const CompetitionProvider = ({ children }) => {
  const { selectedSeason } = useSeason();
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch competitions for the specific season
  useEffect(() => {
    const fetchCompetitions = async () => {
      if (!selectedSeason?._id) {
        setCompetitions([]);
        setSelectedCompetition(null);
        return;
      }

      // Don't reset selectedCompetition immediately - keep previous selection during loading
      setLoading(true);
      try {
        // First, let's see ALL competitions in the database
        const allCompetitionsQuery = `
          *[_type == "competition"] | order(name asc) {
            _id,
            name,
            type,
            format,
            rounds,
            logo,
            description,
            isActive,
            "seasonNames": seasons[]->name,
            "seasonIds": seasons[]->_ref
          }
        `;

        const allCompetitions = await client.fetch(allCompetitionsQuery);
        console.log("🔍 ALL COMPETITIONS IN DATABASE:", allCompetitions);

        // Now fetch competitions for the specific season
        const seasonCompetitionsQuery = `
          *[_type == "competition" && $seasonId in seasons[]._ref] | order(_createdAt desc) {
            _id,
            name,
            type,
            format,
            rounds,
            slug,
            competitionStages[]{
              stageName,
              stageType,
              order,
              isActive
            },
            logo,
            description,
            isActive,
            _createdAt,
            "seasonNames": seasons[]->name
          }
        `;

        const competitionsData = await client.fetch(seasonCompetitionsQuery, {
          seasonId: selectedSeason._id,
        });

        console.log("🎯 COMPETITIONS FOR SELECTED SEASON:", {
          seasonName: selectedSeason.name,
          seasonId: selectedSeason._id,
          competitions: competitionsData,
        });

        setCompetitions(competitionsData);

        // Auto-select League competition (type: 'league') or first available
        if (competitionsData.length > 0) {
          const defaultCompetition =
            competitionsData.find((c) => c.type === "league") ||
            competitionsData.find((c) => c.isActive) ||
            competitionsData[0];
          setSelectedCompetition(defaultCompetition);
          console.log("✅ SELECTED COMPETITION:", defaultCompetition);
        } else {
          setSelectedCompetition(null);
          console.log(" NO COMPETITIONS FOUND FOR SEASON");
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
        setCompetitions([]);
        setSelectedCompetition(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [selectedSeason]);

  const value = {
    competitions,
    selectedCompetition,
    setSelectedCompetition,
    loading,
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
};
