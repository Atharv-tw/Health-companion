"use client";

import { useEffect, useState, useCallback } from "react";
import { Wind, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AirQualityData {
  data: string;
  location: string;
  timestamp: string;
}

interface AirQualityCardProps {
  className?: string;
  compact?: boolean;
}

export function AirQualityCard({ className = "", compact = false }: AirQualityCardProps) {
  const [airData, setAirData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAirQuality = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get user's location
      let location = "Delhi, India"; // Default location

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = `${position.coords.latitude},${position.coords.longitude}`;
        } catch {
          // Use default location if geolocation fails
        }
      }

      const res = await fetch(`/api/air-quality?location=${encodeURIComponent(location)}`);

      if (!res.ok) {
        throw new Error("Failed to fetch air quality data");
      }

      const data = await res.json();
      setAirData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Unable to load air quality data");
      console.error("Air quality fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirQuality();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchAirQuality, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAirQuality]);

  // Parse AQI from response (basic extraction)
  const extractAQI = (text: string): { value: number | null; category: string } => {
    const aqiMatch = text.match(/AQI[:\s]+(\d+)/i);
    const value = aqiMatch ? parseInt(aqiMatch[1]) : null;

    let category = "Unknown";
    if (value !== null) {
      if (value <= 50) category = "Good";
      else if (value <= 100) category = "Moderate";
      else if (value <= 150) category = "Unhealthy for Sensitive";
      else if (value <= 200) category = "Unhealthy";
      else if (value <= 300) category = "Very Unhealthy";
      else category = "Hazardous";
    }

    return { value, category };
  };

  const getAQIColor = (value: number | null): string => {
    if (value === null) return "text-gray-500";
    if (value <= 50) return "text-green-500";
    if (value <= 100) return "text-yellow-500";
    if (value <= 150) return "text-orange-500";
    if (value <= 200) return "text-red-500";
    return "text-purple-600";
  };

  const getAQIBgColor = (value: number | null): string => {
    if (value === null) return "bg-gray-100 dark:bg-gray-700";
    if (value <= 50) return "bg-green-50 dark:bg-green-900/30";
    if (value <= 100) return "bg-yellow-50 dark:bg-yellow-900/30";
    if (value <= 150) return "bg-orange-50 dark:bg-orange-900/30";
    if (value <= 200) return "bg-red-50 dark:bg-red-900/30";
    return "bg-purple-50 dark:bg-purple-900/30";
  };

  const aqi = airData ? extractAQI(airData.data) : { value: null, category: "Loading" };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getAQIBgColor(aqi.value)}`}>
              <Wind className={`w-4 h-4 ${getAQIColor(aqi.value)}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Air Quality</p>
              <p className={`text-lg font-bold ${getAQIColor(aqi.value)}`}>
                {isLoading ? "..." : aqi.value ?? "--"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${getAQIColor(aqi.value)}`}>{aqi.category}</p>
            <button
              onClick={fetchAirQuality}
              disabled={isLoading}
              className="text-[9px] text-gray-400 dark:text-gray-500 hover:text-primary flex items-center gap-1 mt-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-sm flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform ${className}`}
    >
      {error ? (
        <div className="flex flex-col items-center gap-2 text-red-500">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-xs">Unavailable</span>
        </div>
      ) : (
        <>
          <div className={`p-3 rounded-full bg-white dark:bg-gray-700 shadow-sm ${getAQIColor(aqi.value)} mb-2`}>
            <Wind className="w-5 h-5" />
          </div>
          <div className={`text-3xl font-light ${getAQIColor(aqi.value)}`}>
            {isLoading ? "--" : aqi.value ?? "--"}
          </div>
          <div className={`text-xs font-medium ${getAQIColor(aqi.value)} mb-1`}>
            {aqi.category}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Air Quality
          </div>
          <button
            onClick={fetchAirQuality}
            disabled={isLoading}
            className="mt-2 text-[9px] text-gray-400 dark:text-gray-500 hover:text-primary flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </>
      )}
    </motion.div>
  );
}
