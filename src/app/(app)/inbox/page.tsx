
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, CornerDownLeft, Wand2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { autoReplyToMessage, AutoReplyToMessageInput } from "@/ai/flows/auto-reply-to-messages";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  user: string;
  avatar: string;
  platform: 'instagram' | 'facebook' | 'linkedin';
  message: string;
  aiReply?: string;
  confidence?: number;
  isLoading: boolean;
};

const initialMessages: Omit<Message, 'isLoading' | 'aiReply' | 'confidence'>[] = [
  {
    id: 1,
    user: "Ayşe Yılmaz",
    avatar: "https://placehold.co/40x40.png?text=AY",
    platform: "instagram",
    message: "Merhaba, bu ürünün fiyatı nedir?",
  },
  {
    id: 2,
    user: "John Doe",
    avatar: "https://placehold.co/40x40.png?text=JD",
    platform: "facebook",
    message: "Do you have this in blue?",
  },
  {
    id: 3,
    user: "Ahmet Kaya",
    avatar: "https://placehold.co/40x40.png?text=AK",
    platform: "instagram",
    message: "Mağazanız saat kaça kadar açık?",
  },
];

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>(
        initialMessages.map(m => ({ ...m, isLoading: true }))
    );
    const { toast } = useToast();

    useEffect(() => {
        const generateReplies = async () => {
            // In a real app, these would come from the user's settings.
            const knowledgeBaseFacts = "Store hours are 9am-6pm on weekdays, 10am-4pm on weekends. We are located at 123 Main St, Istanbul. We offer free shipping on all orders over 500 TL. The price for product X is 129,99 TL. Product Y is available in blue.";
            const policy = "Be polite and concise. If you don't know the answer, say you will get a human to help.";

            for (const message of messages) {
                if (message.isLoading) { // Only generate if not already generated
                    try {
                        const input: AutoReplyToMessageInput = {
                            // Simple intent detection based on keywords for this demo
                            detectedIntent: message.message.includes("fiyat") || message.message.toLowerCase().includes("price") ? "price" : 
                                            message.message.includes("saat") || message.message.toLowerCase().includes("hours") ? "hours" : "faq",
                            knowledgeBaseFacts,
                            policy,
                            messageText: message.message,
                        };

                        const result = await autoReplyToMessage(input);
                        
                        setMessages(prev => prev.map(m => 
                            m.id === message.id 
                            ? { ...m, aiReply: result.reply, confidence: result.confidenceLevel, isLoading: false } 
                            : m
                        ));

                    } catch (error) {
                        console.error('Error generating reply for message', message.id, error);
                        toast({
                            variant: 'destructive',
                            title: 'AI Reply Failed',
                            description: `Could not generate a reply for the message from ${message.user}.`,
                        });
                         setMessages(prev => prev.map(m => 
                            m.id === message.id 
                            ? { ...m, isLoading: false, aiReply: "Could not generate reply." } 
                            : m
                        ));
                    }
                }
            }
        };
        generateReplies();
    }, []); // Run only once on mount


  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Manage comments and DMs with AI-powered replies.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {messages.map((item) => (
              <li key={item.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback>{item.user.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold">{item.user}</span>
                        <span className="text-muted-foreground text-sm"> on {item.platform}</span>
                      </div>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <p className="text-sm">{item.message}</p>
                    <Card className="bg-background">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                           <Bot className="h-5 w-5 text-primary" />
                           <h3 className="text-base font-semibold leading-none tracking-tight">AI Suggested Reply</h3>
                           {item.confidence && (
                            <Badge variant="outline" className="ml-auto">Confidence: {Math.round(item.confidence * 100)}%</Badge>
                           )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {item.isLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Generating reply...</span>
                            </div>
                        ) : (
                            <>
                            <Textarea defaultValue={item.aiReply} rows={3} />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm"><Wand2 className="h-4 w-4 mr-2" />Refine</Button>
                                <Button size="sm"><CornerDownLeft className="h-4 w-4 mr-2"/>Send Reply</Button>
                            </div>
                            </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
