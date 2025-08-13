
'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp, ThumbsUp, MessageCircle, Eye, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

const engagementByTime = [
  { day: 'Sun', '12-3pm': 90, '3-6pm': 85, '6-9pm': 95 },
  { day: 'Mon', '9-12pm': 70, '12-3pm': 80, '6-9pm': 75 },
  { day: 'Tue', '9-12pm': 65, '12-3pm': 85, '6-9pm': 80 },
  { day: 'Wed', '9-12pm': 75, '12-3pm': 90, '6-9pm': 85 },
  { day: 'Thu', '9-12pm': 80, '12-3pm': 95, '6-9pm': 90 },
  { day: 'Fri', '9-12pm': 85, '12-3pm': 100, '6-9pm': 92 },
  { day: 'Sat', '12-3pm': 95, '3-6pm': 90, '6-9pm': 100 },
];
const timeSlots = ['9-12pm', '12-3pm', '3-6pm', '6-9pm'];

const recentPosts = [
  { id: 1, platform: 'instagram', caption: "Meet our new product line! ✨", impressions: 1250, likes: 256, comments: 32 },
  { id: 2, platform: 'linkedin', caption: "Behind the scenes of our business...", impressions: 800, likes: 120, comments: 15 },
  { id: 3, platform: 'facebook', caption: "Weekend vibes! 🎉 Treat yourself...", impressions: 950, likes: 98, comments: 22 },
  { id: 4, platform: 'instagram', caption: "Our artisanal coffee process.", impressions: 1500, likes: 310, comments: 45 },
  { id: 5, platform: 'facebook', caption: "Customer spotlight! Thanks for the love.", impressions: 750, likes: 80, comments: 18 },
  { id: 6, platform: 'linkedin', caption: "We're hiring! Join our amazing team.", impressions: 1100, likes: 150, comments: 25 },
];

const getHeatmapColor = (value: number | undefined) => {
  if (value === undefined) return 'bg-muted/20';
  if (value > 90) return 'bg-primary/80';
  if (value > 80) return 'bg-primary/60';
  if (value > 70) return 'bg-primary/40';
  if (value > 60) return 'bg-primary/20';
  return 'bg-primary/10';
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and gain insights.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Insights last fetched at: {new Date().toLocaleTimeString()}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
                <RefreshCw className="h-4 w-4"/>
            </Button>
        </div>
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

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Best Times to Post</CardTitle>
            <CardDescription>Heatmap showing post engagement by day and time. Darker is better.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                {/* Y-Axis Labels (Days) */}
                <div></div>
                <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(slot => <div key={slot} className="text-center text-xs font-medium text-muted-foreground">{slot}</div>)}
                </div>

                {/* Heatmap Grid */}
                {engagementByTime.map(row => (
                  <React.Fragment key={row.day}>
                    <div className="text-right text-xs font-medium text-muted-foreground pr-2">{row.day}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(slot => (
                        <TooltipProvider key={slot}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`w-full h-10 rounded-md ${getHeatmapColor((row as any)[slot])} cursor-pointer hover:ring-2 ring-primary`}/>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Engagement: {(row as any)[slot] || 0}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Post Performance</CardTitle>
            <CardDescription>A look at your last 30 posts.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Post</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Likes</TableHead>
                        <TableHead className="text-right">Comments</TableHead>
                        <TableHead className="text-right">Engagement Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentPosts.map(post => {
                        const engagementRate = ((post.likes + post.comments) / post.impressions * 100).toFixed(2);
                        return (
                            <TableRow key={post.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl shrink-0">
                                            {post.platform === 'instagram' ? '📸' : post.platform === 'facebook' ? '👍' : '💼'}
                                        </div>
                                        <p className="font-medium line-clamp-2">{post.caption}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{post.impressions.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{post.likes.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{post.comments.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={parseFloat(engagementRate) > 3 ? 'default' : 'secondary'}>{engagementRate}%</Badge>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
