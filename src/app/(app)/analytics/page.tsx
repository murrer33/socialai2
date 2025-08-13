'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUp, ThumbsUp, MessageCircle, Eye, Link as LinkIcon } from 'lucide-react';

const engagementData = [
  { name: 'Mon', engagement: 400 },
  { name: 'Tue', engagement: 300 },
  { name: 'Wed', engagement: 600 },
  { name: 'Thu', engagement: 800 },
  { name: 'Fri', engagement: 500 },
  { name: 'Sat', engagement: 700 },
  { name: 'Sun', engagement: 900 },
];

const topPosts = [
  { id: 1, platform: 'instagram', caption: "Meet our new product line! ✨", likes: 256, comments: 32 },
  { id: 2, platform: 'linkedin', caption: "Behind the scenes of our business...", likes: 120, comments: 15 },
  { id: 3, platform: 'facebook', caption: "Weekend vibes! 🎉 Treat yourself...", likes: 98, comments: 22 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your performance and gain insights.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes & Reactions</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">+15% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+12.2% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+78</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
            <CardDescription>Performance of your posts over the last week.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>Your most engaging posts this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {topPosts.map(post => (
                <li key={post.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl shrink-0">
                    {post.platform === 'instagram' ? '📸' : post.platform === 'facebook' ? '👍' : '💼'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{post.caption}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600 text-xs">
                    <ArrowUp className="h-3 w-3" /> 25%
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
