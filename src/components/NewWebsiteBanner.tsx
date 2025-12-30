import React, { useState, useEffect } from 'react';

const NewWebsiteBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set the date when the banner should disappear (January 7, 2026)
    const expirationDate = new Date('2026-01-07T00:00:00');
    const currentDate = new Date();

    // Check if current date is past the expiration date
    if (currentDate >= expirationDate) {
      setIsVisible(false);
    }
  }, []);

  // Don't render anything if the banner should be hidden
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-center py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap text-sm font-semibold">
         Welcome to Elite League - Your Ultimate Football Hub!  Live Scores • Match Highlights • Standings • News • Analytics • All in One Place! 
      </div>
    </div>
  );
};

export default NewWebsiteBanner;
