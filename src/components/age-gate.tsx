"use client";

import { useState, useEffect } from 'react';
import './age-gate.css';

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedVerification = localStorage.getItem('ageVerified');
    if (storedVerification === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handleEnter = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVerified(true);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isMounted) {
    return null; // Don't render anything on the server or before hydration
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="age-verify">
        <div className="age-verify-content">
          <h2>Age Verification</h2>
          <p>This website may contain adult content and is intended for viewers 18 years or older.</p>
          <div className="age-buttons">
            <button className="age-btn enter" onClick={handleEnter}>I am 18 or older</button>
            <button className="age-btn exit" onClick={handleExit}>I am under 18</button>
          </div>
        </div>
      </div>
      {/* Render children with display: none to ensure the page is fully loaded behind the modal */}
      <div style={{ display: 'none' }}>{children}</div>
    </>
  );
}
