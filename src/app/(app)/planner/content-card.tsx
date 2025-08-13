
'use client';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, MoreHorizontal, RefreshCw, Undo2, Clock, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Post } from './page';

type ContentCardProps = {
  post: Post;
  onEdit: (post: Post) => void;
  onApprove: (post: Post) => void;
  isGeneratingImage: boolean;
};

export function ContentCard({ post, onEdit, onApprove, isGeneratingImage }: ContentCardProps) {
  const platformIcons = {
    instagram: '📸',
    facebook: '👍',
    linkedin: '💼',
  };

  const isApproved = post.status === 'approved';

  return (
    <Card className={`flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${isApproved ? 'border-primary' : ''}`}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{post.day}</span>
            <div className="flex items-center gap-1">
              {post.platforms.map(p => (
                <span key={p} title={p} className="text-xs">{platformIcons[p as keyof typeof platformIcons]}</span>
              ))}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{post.recommended_time_local}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
            {isGeneratingImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Generating image...</p>
              </div>
            ) : (
               <Image
                src={post.imageDataUri || 'https://placehold.co/400x400/cccccc/ffffff.png?text=No+Image'}
                alt={post.visual_brief}
                data-ai-hint="social media post"
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm line-clamp-3">{post.caption_en}</p>
            <div className="flex flex-wrap gap-1">
              {post.hashtags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="p-4 bg-muted/50">
        <Button className="w-full" variant={isApproved ? "default" : "outline"} onClick={() => onApprove(post)}>
          {isApproved ? (
            <>
              <Undo2 className="mr-2 h-4 w-4" />
              Unapprove
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
