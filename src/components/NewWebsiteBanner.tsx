import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NewWebsiteBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('bannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    // Set the date when the banner should disappear (January 7, 2026)
    const expirationDate = new Date('2026-01-07T00:00:00');
    const currentDate = new Date();

    // Check if current date is past the expiration date
    if (currentDate >= expirationDate) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Remember user's choice in localStorage
    localStorage.setItem('bannerDismissed', 'true');
  };

  // Don't render anything if the banner should be hidden
  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-center py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap text-sm font-semibold">
         Welcome to Elite League - Your Ultimate Football Hub!  Live Scores • Match Highlights • Standings • News • Analytics • All in One Place! 
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-foreground/20 rounded transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

export default NewWebsiteBanner;
