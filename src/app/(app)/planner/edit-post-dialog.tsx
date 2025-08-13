
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { type GenerateWeeklyContentPlanOutput } from '@/ai/flows/generate-weekly-content-plan';
import { useEffect, useState } from 'react';

type EditPostDialogProps = {
  post: GenerateWeeklyContentPlanOutput['posts'][number] | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPost: GenerateWeeklyContentPlanOutput['posts'][number]) => void;
};

export function EditPostDialog({ post, isOpen, onOpenChange, onSave }: EditPostDialogProps) {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');

  useEffect(() => {
    if (post) {
      setCaption(post.caption_en);
      setHashtags(post.hashtags.join('\n'));
    }
  }, [post]);

  const handleSave = () => {
    if (post) {
      const updatedPost = {
        ...post,
        caption_en: caption,
        // Also update caption_tr if needed, maybe regenerate it
        caption_tr: caption, // for now just copy
        hashtags: hashtags.split('\n').filter(h => h.trim() !== ''),
      };
      onSave(updatedPost);
      onOpenChange(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Post for {post.day}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="caption">Caption (EN)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hashtags">Hashtags (one per line)</Label>
            <Textarea
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
