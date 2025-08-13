'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Languages } from 'lucide-react';
import { ContentCard } from './content-card';
import type { GenerateWeeklyContentPlanOutput } from '@/ai/flows/generate-weekly-content-plan';
import { mockPlan } from './mock-plan';

export default function PlannerPage() {
  const [plan, setPlan] = useState<GenerateWeeklyContentPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = () => {
    setIsLoading(true);
    // In a real app, you would call the AI flow here.
    // For this MVP, we use mock data after a short delay.
    setTimeout(() => {
      setPlan(mockPlan);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Content Planner</h1>
          <p className="text-muted-foreground">
            Review, edit, and approve your weekly content.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline"><Languages className="mr-2 h-4 w-4" /> EN/TR</Button>
          <Button onClick={handleGeneratePlan} disabled={isLoading}>
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
          </Button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plan.posts.map((post, index) => (
            <ContentCard key={index} post={post} />
          ))}
        </div>
      ) : (
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Welcome to Sosyal AI</CardTitle>
            <CardDescription>Your AI-powered social media assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center gap-6 p-12">
            <div className="p-4 bg-primary/10 rounded-full">
                <Bot className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Ready to create?</h3>
                <p className="text-muted-foreground max-w-sm">
                Click the "Generate Plan" button to create your first week of social media content in seconds.
                </p>
            </div>
            <Button onClick={handleGeneratePlan} disabled={isLoading}>
              {isLoading ? 'Generating Plan...' : 'Generate Your First Plan'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
