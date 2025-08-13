
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Languages, Loader2 } from 'lucide-react';
import { ContentCard } from './content-card';
import type { GenerateWeeklyContentPlanOutput } from '@/ai/flows/generate-weekly-content-plan';
import { generateWeeklyContentPlan } from '@/ai/flows/generate-weekly-content-plan';
import { useToast } from '@/hooks/use-toast';
import { EditPostDialog } from './edit-post-dialog';
import { Clock } from 'lucide-react';

export type Post = GenerateWeeklyContentPlanOutput['posts'][number] & { status: 'draft' | 'approved' | 'published' };
type Plan = Omit<GenerateWeeklyContentPlanOutput, 'posts'> & { posts: Post[] };

export default function PlannerPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would get these values from the settings page.
      // For now, we'll use some default values.
      const result = await generateWeeklyContentPlan({
        brandBrief: 'A cozy and friendly cafe in Istanbul, known for its artisanal coffee and homemade pastries. We want to be seen as a neighborhood gem.',
        catalogItems: ['Latte', 'Croissant', 'Cheesecake', 'Turkish Coffee'],
        holidaysEvents: 'No upcoming holidays.',
        preferredCadence: '7 posts per week',
        platforms: ['instagram', 'facebook', 'linkedin'],
      });
      const postsWithStatus: Post[] = result.posts.map(p => ({ ...p, status: 'draft' }));
      setPlan({ ...result, posts: postsWithStatus });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Plan',
        description: 'There was an issue creating your content plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleSavePost = (updatedPost: Post) => {
    if (plan) {
      const updatedPosts = plan.posts.map(p => (p.day === updatedPost.day ? updatedPost : p));
      setPlan({ ...plan, posts: updatedPosts });
    }
    setIsEditDialogOpen(false);
    setEditingPost(null);
  };
  
  const handleApprovePost = (postToApprove: Post) => {
    if (plan) {
      const updatedPosts = plan.posts.map(p =>
        p.day === postToApprove.day
          ? { ...p, status: p.status === 'approved' ? 'draft' : 'approved' }
          : p
      );
      setPlan({ ...plan, posts: updatedPosts });
    }
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
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generating...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
          </Button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plan.posts.map((post, index) => (
            <ContentCard key={index} post={post} onEdit={handleEditClick} onApprove={handleApprovePost} />
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
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating Plan...' : 'Generate Your First Plan'}
            </Button>
          </CardContent>
        </Card>
      )}
       <EditPostDialog
        post={editingPost}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSavePost}
      />
    </div>
  );
}
