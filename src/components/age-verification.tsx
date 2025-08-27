"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"

interface AgeVerificationProps {
  onVerified: () => void
}

export default function AgeVerification({ onVerified }: AgeVerificationProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleExit = () => {
    window.location.href = "https://www.google.com"
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-4">
      <div className="text-center max-w-md space-y-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Age Verification
        </h2>

        <div className="space-y-4">
          <p className="text-gray-300 text-lg">This website contains adult content and is only for viewers 18+</p>

          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-300 text-sm">
              By clicking "I am 18 or older", you confirm that you are of legal age to view adult content in your
              jurisdiction.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={onVerified}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
            size="lg"
          >
            I am 18 or older
          </Button>

          <Button
            onClick={handleExit}
            variant="outline"
            className="border-gray-400 text-gray-300 hover:bg-gray-800 py-3 text-lg bg-transparent"
            size="lg"
          >
            I am under 18
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-6">
          <p>© 2025 RSS Reader. All rights reserved.</p>
          <p>This site is not affiliated with any content providers.</p>
        </div>
      </div>
    </div>
  )
}
