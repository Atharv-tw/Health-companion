"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vitals } from "@/lib/validators";

interface VitalsInputProps {
  value: Vitals;
  onChange: (value: Vitals) => void;
}

export function VitalsInput({ value = {}, onChange }: VitalsInputProps) {
  const handleChange = (field: keyof NonNullable<Vitals>, rawValue: string) => {
    const numValue = rawValue === "" ? undefined : parseFloat(rawValue);
    onChange({ ...value, [field]: numValue });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Vital Signs</Label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter any vitals you&apos;ve measured (all fields are optional)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heart Rate */}
        <div className="space-y-2">
          <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
          <div className="relative">
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              min={30}
              max={250}
              value={value?.heartRate ?? ""}
              onChange={(e) => handleChange("heartRate", e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
              bpm
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Normal: 60-100 bpm</p>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°C)</Label>
          <div className="relative">
            <Input
              id="temperature"
              type="number"
              placeholder="37.0"
              step="0.1"
              min={35}
              max={43}
              value={value?.temperature ?? ""}
              onChange={(e) => handleChange("temperature", e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
              °C
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Normal: 36.1-37.2°C</p>
        </div>

        {/* Blood Pressure */}
        <div className="space-y-2">
          <Label>Blood Pressure (mmHg)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="120"
              min={70}
              max={250}
              value={value?.bpSystolic ?? ""}
              onChange={(e) => handleChange("bpSystolic", e.target.value)}
              className="w-24"
            />
            <span className="text-gray-400">/</span>
            <Input
              type="number"
              placeholder="80"
              min={40}
              max={150}
              value={value?.bpDiastolic ?? ""}
              onChange={(e) => handleChange("bpDiastolic", e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-gray-400 dark:text-gray-500">mmHg</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Normal: 120/80 mmHg</p>
        </div>

        {/* SpO2 */}
        <div className="space-y-2">
          <Label htmlFor="spO2">Oxygen Saturation (SpO2)</Label>
          <div className="relative">
            <Input
              id="spO2"
              type="number"
              placeholder="98"
              min={70}
              max={100}
              value={value?.spO2 ?? ""}
              onChange={(e) => handleChange("spO2", e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
              %
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Normal: 95-100%</p>
        </div>
      </div>
    </div>
  );
}
