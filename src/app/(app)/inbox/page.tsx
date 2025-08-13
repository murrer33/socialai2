import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bot, CornerDownLeft, Wand2 } from "lucide-react";

const messages = [
  {
    id: 1,
    user: "Ayşe Yılmaz",
    avatar: "https://placehold.co/40x40.png?text=AY",
    platform: "instagram",
    message: "Merhaba, bu ürünün fiyatı nedir?",
    aiReply: "Merhaba! Bu ürünümüz 129,99 TL'dir. Başka bir sorunuz var mı?",
    confidence: 0.95,
  },
  {
    id: 2,
    user: "John Doe",
    avatar: "https://placehold.co/40x40.png?text=JD",
    platform: "facebook",
    message: "Do you have this in blue?",
    aiReply: "Thanks for asking! Yes, this product is available in blue. Would you like a link to order?",
    confidence: 0.92,
  },
  {
    id: 3,
    user: "Ahmet Kaya",
    avatar: "https://placehold.co/40x40.png?text=AK",
    platform: "instagram",
    message: "Mağazanız saat kaça kadar açık?",
    aiReply: "Merhaba! Mağazamız hafta içi 09:00-19:00, hafta sonu ise 10:00-18:00 saatleri arasında açıktır.",
    confidence: 0.98,
  },
];

export default function InboxPage() {
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
                           <CardTitle className="text-base">AI Suggested Reply</CardTitle>
                           <Badge variant="outline" className="ml-auto">Confidence: {Math.round(item.confidence * 100)}%</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Textarea defaultValue={item.aiReply} rows={3} />
                         <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" size="sm"><Wand2 className="h-4 w-4 mr-2" />Refine</Button>
                            <Button size="sm"><CornerDownLeft className="h-4 w-4 mr-2"/>Send Reply</Button>
                        </div>
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
