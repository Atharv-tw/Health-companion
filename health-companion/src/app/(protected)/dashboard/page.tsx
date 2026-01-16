"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskCard, RiskAssessmentData, RiskBadge } from "@/components/health/RiskCard";

interface HealthSummary {
  summary: {
    totalLogs: number;
    dateRange: { start: string; end: string };
    symptoms: {
      mostCommon: Array<{ name: string; count: number }>;
      totalReported: number;
    };
    vitals: {
      averages: {
        heartRate: number | null;
        temperature: number | null;
        bpSystolic: number | null;
        bpDiastolic: number | null;
        spO2: number | null;
      };
    };
    lifestyle: {
      averages: {
        avgSleepHours: number | null;
        stressDistribution: Record<string, number>;
        hydrationDistribution: Record<string, number>;
      };
    };
    latestRiskLevel: string | null;
    dailyTrends: Array<{ date: string; logs: number; symptoms: number }>;
  };
  latestLog?: {
    id: string;
    createdAt: string;
    symptoms: { items: Array<{ name: string; severity: string }>; freeText?: string };
    vitals: Record<string, number>;
    lifestyle: Record<string, unknown>;
    riskAlert?: {
      id: string;
      riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
      reasons: string[];
      nextSteps: string[];
      redFlags: string[];
      consultAdvice: string;
    };
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [healthData, setHealthData] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthSummary = async () => {
      try {
        const res = await fetch("/api/health/summary?range=7d");
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
        }
      } catch (error) {
        console.error("Failed to fetch health summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthSummary();
  }, []);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your health and get personalized guidance.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Show Risk Card prominently if there's a recent assessment */}
          {healthData?.latestLog?.riskAlert && (
            <RiskCard
              assessment={healthData.latestLog.riskAlert as RiskAssessmentData}
              showDetails={healthData.latestLog.riskAlert.riskLevel !== "LOW"}
            />
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Latest Health Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest Health Log</CardTitle>
                <CardDescription>Your most recent health entry</CardDescription>
              </CardHeader>
              <CardContent>
                {healthData?.latestLog ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      {formatDate(healthData.latestLog.createdAt)}
                    </p>
                    {healthData.latestLog.symptoms.items.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {healthData.latestLog.symptoms.items.slice(0, 3).map((s) => (
                          <Badge key={s.name} variant="secondary" className="text-xs">
                            {s.name}
                          </Badge>
                        ))}
                        {healthData.latestLog.symptoms.items.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{healthData.latestLog.symptoms.items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No symptoms reported</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No health logs yet.{" "}
                    <Link href="/log" className="text-blue-600 hover:underline">
                      Start logging
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Risk Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Status</CardTitle>
                <CardDescription>Current health risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {healthData?.summary.latestRiskLevel ? (
                    <RiskBadge riskLevel={healthData.summary.latestRiskLevel as "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY"} />
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-700">No active alerts</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Based on your latest health log
                </p>
              </CardContent>
            </Card>

            {/* 7-Day Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">7-Day Summary</CardTitle>
                <CardDescription>Health activity this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Logs</span>
                    <span className="font-medium">{healthData?.summary.totalLogs || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Symptoms Reported</span>
                    <span className="font-medium">{healthData?.summary.symptoms.totalReported || 0}</span>
                  </div>
                  {healthData?.summary.lifestyle.averages.avgSleepHours && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Sleep</span>
                      <span className="font-medium">
                        {healthData.summary.lifestyle.averages.avgSleepHours}h
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Symptoms */}
          {healthData?.summary.symptoms.mostCommon && healthData.summary.symptoms.mostCommon.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Reported Symptoms (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {healthData.summary.symptoms.mostCommon.map((symptom) => (
                    <Badge key={symptom.name} variant="outline">
                      {symptom.name} ({symptom.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vitals Summary */}
          {(healthData?.summary.vitals.averages.heartRate ||
            healthData?.summary.vitals.averages.temperature ||
            healthData?.summary.vitals.averages.spO2) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Vitals (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {healthData.summary.vitals.averages.heartRate && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {healthData.summary.vitals.averages.heartRate}
                      </p>
                      <p className="text-xs text-gray-500">Heart Rate (bpm)</p>
                    </div>
                  )}
                  {healthData.summary.vitals.averages.temperature && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {healthData.summary.vitals.averages.temperature}°
                      </p>
                      <p className="text-xs text-gray-500">Temperature (°C)</p>
                    </div>
                  )}
                  {healthData.summary.vitals.averages.bpSystolic && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {healthData.summary.vitals.averages.bpSystolic}/
                        {healthData.summary.vitals.averages.bpDiastolic}
                      </p>
                      <p className="text-xs text-gray-500">Blood Pressure</p>
                    </div>
                  )}
                  {healthData.summary.vitals.averages.spO2 && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {healthData.summary.vitals.averages.spO2}%
                      </p>
                      <p className="text-xs text-gray-500">SpO2</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/log"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Log Health</div>
              <div className="text-xs text-gray-500">Record symptoms & vitals</div>
            </Link>
            <Link
              href="/chat"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">Chat</div>
              <div className="text-xs text-gray-500">Get health guidance</div>
            </Link>
            <Link
              href="/reports"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">Reports</div>
              <div className="text-xs text-gray-500">Upload medical reports</div>
            </Link>
            <Link
              href="/sos"
              className="p-4 border rounded-lg hover:bg-red-50 transition-colors text-center border-red-200"
            >
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-medium text-red-600">SOS</div>
              <div className="text-xs text-gray-500">Emergency contacts</div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
