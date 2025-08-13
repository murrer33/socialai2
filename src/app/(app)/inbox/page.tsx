
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, CornerDownLeft, Wand2, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { autoReplyToMessage, AutoReplyToMessageInput } from "@/ai/flows/auto-reply-to-messages";
import { polishCaption, PolishCaptionInput } from "@/ai/flows/polish-caption";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  user: string;
  avatar: string;
  platform: 'instagram' | 'facebook' | 'linkedin';
  message: string;
  aiReply?: string;
  confidence?: number;
  label?: 'FAQ' | 'Engagement' | 'Complaint' | 'Sensitive';
  isGenerating: boolean;
  isRefining: boolean;
};

const initialMessages: Omit<Message, 'isGenerating' | 'isRefining' | 'aiReply' | 'confidence' | 'label'>[] = [
  {
    id: 1,
    user: "User 1",
    avatar: "https://placehold.co/40x40.png?text=U1",
    platform: "instagram",
    message: "Merhaba, bu ürünün fiyatı nedir?",
  },
  {
    id: 2,
    user: "User 2",
    avatar: "https://placehold.co/40x40.png?text=U2",
    platform: "facebook",
    message: "Bu hizmetinizden hiç memnun kalmadım.",
  },
  {
    id: 3,
    user: "User 3",
    avatar: "https://placehold.co/40x40.png?text=U3",
    platform: "instagram",
    message: "Mağazanız saat kaça kadar açık?",
  },
  {
    id: 4,
    user: "User 4",
    avatar: "https://placehold.co/40x40.png?text=U4",
    platform: "instagram",
    message: "Harika bir ürün, çok teşekkürler! ❤️",
  }
];

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>(
        initialMessages.map(m => ({ ...m, isGenerating: false, isRefining: false }))
    );
    const { toast } = useToast();

    // In a real app, this would come from the user's settings (GET /brand)
    const brandTone = { friendly: 80, playful: 40, simple: 70 };

    // This effect runs once to generate a reply for the first message,
    // simulating a more realistic on-demand or webhook-driven workflow.
    useEffect(() => {
        const generateInitialReply = async () => {
            const firstMessage = messages[0];
            if (firstMessage && !firstMessage.aiReply) {
                 setMessages(prev => prev.map(m => m.id === firstMessage.id ? { ...m, isGenerating: true } : m));

                // In a real app, these would come from the user's settings (GET /knowledge_base & /brand)
                const knowledgeBaseFacts = "Store hours are 9am-6pm on weekdays, 10am-4pm on weekends. We are located at 123 Main St, Istanbul. We offer free shipping on all orders over 500 TL. The price for product X is 129,99 TL. Product Y is available in blue.";
                const policy = "Be polite and concise. If you don't know the answer, say you will get a human to help.";

                try {
                    const input: AutoReplyToMessageInput = {
                        knowledgeBaseFacts,
                        policy,
                        messageText: firstMessage.message,
                    };

                    const result = await autoReplyToMessage(input);
                    
                    setMessages(prev => prev.map(m => 
                        m.id === firstMessage.id 
                        ? { ...m, aiReply: result.suggestedReply, confidence: result.confidence, label: result.label, isGenerating: false } 
                        : m
                    ));

                } catch (error) {
                    console.error('Error generating reply for message', firstMessage.id, error);
                    toast({
                        variant: 'destructive',
                        title: 'AI Reply Failed',
                        description: `Could not generate a reply for the message from ${firstMessage.user}.`,
                    });
                     setMessages(prev => prev.map(m => 
                        m.id === firstMessage.id 
                        ? { ...m, isGenerating: false, aiReply: "Could not generate reply." } 
                        : m
                    ));
                }
            }
        };
        generateInitialReply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handleRefine = async (messageId: number) => {
        const message = messages.find(m => m.id === messageId);
        if (!message || !message.aiReply) return;

        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRefining: true } : m));

        try {
            const input: PolishCaptionInput = {
                caption: message.aiReply,
                tone: brandTone,
            };
            const result = await polishCaption(input);

            setMessages(prev => prev.map(m => 
                m.id === messageId 
                ? { ...m, aiReply: result.polishedCaption, isRefining: false } 
                : m
            ));
            toast({
                title: "Reply Refined",
                description: "The AI has polished the suggested reply.",
            });
        } catch (error) {
            console.error('Error refining reply for message', messageId, error);
            toast({
                variant: 'destructive',
                title: 'Refinement Failed',
                description: 'Could not refine the reply. Please try again.',
            });
             setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRefining: false } : m));
        }
    };

    const handleTextChange = (messageId: number, newText: string) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, aiReply: newText } : m));
    };


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
                            {item.label && (
                                <Badge variant={item.label === 'Complaint' || item.label === 'Sensitive' ? 'destructive' : 'outline'} className="ml-2">{item.label}</Badge>
                            )}
                           {item.confidence !== undefined && (
                            <Badge variant={item.confidence > 0.8 ? 'default' : 'secondary'} className="ml-auto">
                                Confidence: {Math.round(item.confidence * 100)}%
                            </Badge>
                           )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {item.isGenerating ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Generating reply...</span>
                            </div>
                        ) : !item.aiReply && (item.label === 'Complaint' || item.label === 'Sensitive') ? (
                             <div className="flex items-center gap-3 p-4 rounded-md border border-amber-500/50 bg-amber-500/10 text-amber-800">
                                <ShieldAlert className="h-6 w-6 text-amber-600" />
                                <div className="flex-1">
                                    <h4 className="font-semibold">Requires Human Review</h4>
                                    <p className="text-sm">The AI classified this message as a '{item.label}' and will not suggest a reply.</p>
                                </div>
                             </div>
                        ) : item.aiReply ? (
                            <>
                            <Textarea 
                                value={item.aiReply}
                                onChange={(e) => handleTextChange(item.id, e.target.value)}
                                rows={3} 
                                disabled={item.isRefining}
                             />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => handleRefine(item.id)} disabled={item.isRefining || !item.aiReply}>
                                    {item.isRefining ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                    Refine
                                </Button>
                                <Button size="sm"><CornerDownLeft className="h-4 w-4 mr-2"/>Send Reply</Button>
                            </div>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground italic text-center py-4">
                                AI reply not generated for this message.
                            </div>
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
