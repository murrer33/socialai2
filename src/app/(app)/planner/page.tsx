
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Languages, Loader2 } from 'lucide-react';
import { ContentCard } from './content-card';
import type { GenerateWeeklyContentPlanOutput } from '@/ai/flows/generate-weekly-content-plan';
import { generateWeeklyContentPlan } from '@/ai/flows/generate-weekly-content-plan';
import { generateImageFromVisualBrief } from '@/ai/flows/generate-image-from-visual-brief';
import { useToast } from '@/hooks/use-toast';
import { EditPostDialog } from './edit-post-dialog';

export type Post = GenerateWeeklyContentPlanOutput['posts'][number] & { 
  status: 'draft' | 'approved' | 'published';
  imageDataUri?: string; 
};
type Plan = Omit<GenerateWeeklyContentPlanOutput, 'posts'> & { posts: Post[] };

// Placeholder logo. In a real app, this would be uploaded by the user in settings.
const PLACEHOLDER_LOGO_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvZmZlZSI+PHBhdGggZD0iTTExIDVIOThhMiAyIDAgMCAxIDIgMnY0YTQgNCAwIDAgMCA0IDRoMmEyIDIgMCAwIDEgMiAydjZhNiA2IDAgMCAxLTYgNkg3YTYgNiAwIDAgMS02LTZWOGEyIDIgMCAwIDEgMi0yaDJhNCA0IDAgMCAwIDQtNE0xIDVWNE01IDVWNE05IDVWNCIvPjwvc3ZnPg==';

export default function PlannerPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setPlan(null); // Clear previous plan

    // In a real app, this data would be fetched from GET /brand
    const brandProfile = {
        brandBrief: 'A cozy and friendly cafe in Istanbul, known for its artisanal coffee and homemade pastries. We want to be seen as a neighborhood gem.',
        catalogItems: ['Latte', 'Croissant', 'Cheesecake', 'Turkish Coffee'],
        brandColor: '#3F51B5',
        logoDataUri: PLACEHOLDER_LOGO_DATA_URI
    };

    try {
      // Simulate API call: POST /api/v1/plans/generate
      console.log('Simulating POST /api/v1/plans/generate');
      const generatedPlan = await generateWeeklyContentPlan({
        brandBrief: brandProfile.brandBrief,
        catalogItems: brandProfile.catalogItems,
        holidaysEvents: 'No upcoming holidays.',
        preferredCadence: '7 posts per week',
        platforms: ['instagram', 'facebook', 'linkedin'],
      });
      
      const postsWithStatus: Post[] = generatedPlan.posts.map(p => ({ ...p, status: 'draft' }));
      
      // Immediately set the plan with text content.
      // This simulates the response from GET /api/v1/plans/current
      setPlan({ ...generatedPlan, posts: postsWithStatus });
      setIsLoading(false); 
      setIsGeneratingImages(true); 

      // Simulate the backend generating images via POST /api/v1/assets/generate
      // and updating the post records. The frontend then re-fetches.
      console.log('Simulating POST /api/v1/assets/generate for each post');
      const imagePromises = postsWithStatus.map(async (post) => {
        try {
          const imageResult = await generateImageFromVisualBrief({
            visualBrief: post.visual_brief,
            brandColor: brandProfile.brandColor,
            logoDataUri: brandProfile.logoDataUri,
          });
           setPlan(currentPlan => {
            if (!currentPlan) return null;
            const updatedPosts = currentPlan.posts.map(p => 
              p.day === post.day ? { ...p, imageDataUri: imageResult.imageDataUri } : p
            );
            return { ...currentPlan, posts: updatedPosts };
          });
        } catch (imgError) {
          console.error(`Error generating image for ${post.day}:`, imgError);
          toast({
            variant: 'destructive',
            title: 'Image Generation Failed',
            description: `Could not create an image for ${post.day}'s post.`,
          });
          setPlan(currentPlan => {
            if (!currentPlan) return null;
            const updatedPosts = currentPlan.posts.map(p => 
              p.day === post.day ? { ...p, imageDataUri: 'https://placehold.co/400x400.png' } : p
            );
            return { ...currentPlan, posts: updatedPosts };
          });
        }
      });
      
      await Promise.all(imagePromises);

    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Plan',
        description: 'There was an issue creating your content plan. Please try again.',
      });
      setIsLoading(false);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const handleSavePost = (updatedPost: Post) => {
    // Simulate API call: PUT /api/v1/posts/:id
    console.log('Simulating PUT /api/v1/posts/:id with data:', updatedPost);
    if (plan) {
      const updatedPosts = plan.posts.map(p => (p.day === updatedPost.day ? updatedPost : p));
      setPlan({ ...plan, posts: updatedPosts });
      toast({
        title: "Post Updated",
        description: "Your changes have been saved.",
      });
    }
    setIsEditDialogOpen(false);
    setEditingPost(null);
  };
  
  const handleApprovePost = (postToApprove: Post) => {
     // Simulate API call: PUT /api/v1/plans/:id/approve (for a single post)
    console.log('Simulating approval for post:', postToApprove.day);
    if (plan) {
      const newStatus = postToApprove.status === 'approved' ? 'draft' : 'approved';
      const updatedPosts = plan.posts.map(p =>
        p.day === postToApprove.day
          ? { ...p, status: newStatus }
          : p
      );
      setPlan({ ...plan, posts: updatedPosts });
       toast({
        title: `Post ${newStatus === 'approved' ? 'Approved' : 'Unapproved'}`,
        description: `The post for ${postToApprove.day} is now a ${newStatus}.`,
      });
    }
  };

  const showLoadingState = isLoading || isGeneratingImages;

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
          <Button onClick={handleGeneratePlan} disabled={showLoadingState}>
            {showLoadingState ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            {isLoading ? 'Generating Plan...' : isGeneratingImages ? 'Creating Images...' : plan ? 'Regenerate Plan' : 'Generate Plan'}
          </Button>
        </div>
      </div>

      {plan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plan.posts.map((post, index) => (
            <ContentCard key={index} post={post} onEdit={handleEditClick} onApprove={handleApprovePost} isGeneratingImage={!post.imageDataUri} />
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

    