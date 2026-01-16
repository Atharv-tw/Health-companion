"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SOSPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Emergency SOS</h1>
        <p className="text-gray-600 mt-1">
          Quick access to emergency contacts and services.
        </p>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Emergency Button</CardTitle>
          <CardDescription className="text-red-600">
            Use in case of medical emergency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-xl">
            SOS - Get Emergency Help
          </Button>
          <p className="text-sm text-red-600 text-center">
            This will display your emergency contacts and nearby hospital information.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>
            Add up to 3 emergency contacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Emergency contacts management will be implemented in Stage G.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Find Nearby Help</CardTitle>
          <CardDescription>
            Locate hospitals and emergency services near you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" asChild>
            <a
              href="https://www.google.com/maps/search/hospital+near+me"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find Hospitals Near Me
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
