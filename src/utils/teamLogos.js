import manchesterCityLogo from "@/assets/teams/manchester-city.png";
import arsenalLogo from "@/assets/teams/arsenal.png";
import liverpoolLogo from "@/assets/teams/liverpool.png";
import manchesterUnitedLogo from "@/assets/teams/manchester-united.png";
import chelseaLogo from "@/assets/teams/chelsea.png";
import tottenhamLogo from "@/assets/teams/tottenham.png";
import newcastleLogo from "@/assets/teams/newcastle.png";

export const teamLogos = {
  "Manchester City": manchesterCityLogo,
  "Arsenal": arsenalLogo,
  "Liverpool": liverpoolLogo,
  "Manchester United": manchesterUnitedLogo,
  "Chelsea": chelseaLogo,
  "Tottenham": tottenhamLogo,
  "Newcastle": newcastleLogo,
};

// Generate a placeholder SVG for teams without logos
const generatePlaceholder = (teamName) => {
  if (!teamName) return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='40' fill='%23666'%3E?%3C/text%3E%3C/svg%3E";
  
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  
  // Generate a color based on team name
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const bgColor = `hsl(${hue}, 60%, 50%)`;
  const textColor = '#ffffff';
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${encodeURIComponent(bgColor)}'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='${initials.length > 2 ? '24' : '32'}' font-weight='bold' fill='${textColor}'%3E${initials}%3C/text%3E%3C/svg%3E`;
};

// Synchronous logo resolution: DB URL -> static asset -> generated placeholder
export const getTeamLogo = (teamName, logoUrl = null) => {
  if (!teamName) return generatePlaceholder(teamName);
  
  // Priority 1: Use provided logo_url from database
  if (logoUrl) return logoUrl;
  
  // Priority 2: Check local static imports
  if (teamLogos[teamName]) return teamLogos[teamName];
  
  // Priority 3: Generate placeholder
  return generatePlaceholder(teamName);
};
