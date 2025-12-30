import React from "react";

const SeasonsSection = ({ seasons }) => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Seasons</h2>
    <ul className="space-y-2">
      {seasons.map((season) => (
        <li key={season.id} className="p-4 bg-card border rounded-lg">
          <h3 className="font-semibold">{season.year}</h3>
          <p className="text-sm opacity-70">
            {season.description || "No description provided"}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

export default SeasonsSection;
