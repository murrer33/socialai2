
'use client'

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Bot, FileUp, Link as LinkIcon, UploadCloud, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { generateBrandBrief } from "@/ai/flows/generate-brand-brief"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"

const brandProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  tone: z.string().min(1, "Tone of voice is required."),
  pitch: z.string().min(1, "Elevator pitch is required."),
  logo: z.any().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color."),
  catalog: z.any().optional(),
});

type BrandProfileFormValues = z.infer<typeof brandProfileSchema>;

type Connection = {
  id: 'instagram' | 'facebook' | 'linkedin';
  name: string;
  logoHint: string;
  connected: boolean;
  accountName?: string;
};

type KnowledgeFact = {
    id: number;
    text: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandBrief, setBrandBrief] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'instagram', name: 'Instagram Business', logoHint: 'instagram logo', connected: false },
    { id: 'facebook', name: 'Facebook Page', logoHint: 'facebook logo', connected: true, accountName: 'My Biz Page' },
    { id: 'linkedin', name: 'LinkedIn Company Page', logoHint: 'linkedin logo', connected: false },
  ]);
  const [knowledgeFacts, setKnowledgeFacts] = useState<KnowledgeFact[]>([
      { id: 1, text: "Store hours are 9am-6pm on weekdays, 10am-4pm on weekends." },
      { id: 2, text: "We are located at 123 Main St, Istanbul." },
      { id: 3, text: "We offer free shipping on all orders over 500 TL." },
  ]);
  const [newFact, setNewFact] = useState("");

  const handleAddFact = () => {
      if (newFact.trim()) {
          setKnowledgeFacts([...knowledgeFacts, { id: Date.now(), text: newFact.trim() }]);
          setNewFact("");
          toast({
              title: "Fact Added",
              description: "The new fact has been added to your knowledge base.",
          })
      }
  };
  
  const handleDeleteFact = (id: number) => {
      setKnowledgeFacts(knowledgeFacts.filter(fact => fact.id !== id));
      toast({
          variant: 'destructive',
          title: "Fact Removed",
          description: "The fact has been removed from your knowledge base.",
      })
  };

  const handleConnectionToggle = (id: Connection['id']) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.id === id
          ? {
              ...conn,
              connected: !conn.connected,
              accountName: !conn.connected ? `Connected ${conn.name}` : undefined,
            }
          : conn
      )
    );
    toast({
        title: "Connection Updated",
        description: `Your ${id} account has been ${connections.find(c => c.id === id)?.connected ? 'disconnected' : 'connected'}.`,
    })
  };

  const form = useForm<BrandProfileFormValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      companyName: "",
      tone: "friendly",
      pitch: "",
      primaryColor: "#3F51B5",
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload a logo smaller than 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setLogoPreview(dataUri);
        form.setValue("logo", dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBrief = async () => {
    const values = form.getValues();
    const validation = await form.trigger(["companyName", "pitch", "tone"]);

    if (!validation) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out Company Name, Tone, and Elevator Pitch before generating a brief.",
        });
        return;
    }

    setIsGenerating(true);
    setBrandBrief("");

    try {
      const result = await generateBrandBrief({
        companyProfile: `${values.companyName}: ${values.pitch}`,
        audience: 'Turkish SMEs', // Placeholder until audience field is added
        tone: values.tone,
      });
      setBrandBrief(result.brandBrief);
      setToneTokens(result.toneTokens);
      toast({
        title: "Brand Brief Generated",
        description: "Your AI-powered brand brief is ready!",
      });
    } catch (error) {
      console.error("Error generating brand brief:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an issue creating your brand brief. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: BrandProfileFormValues) => {
    console.log(data)
    toast({
        title: "Settings Saved",
        description: "Your brand profile has been updated.",
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your brand, connections, and preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Brand Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="auto-reply">Auto-Reply</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Profile</CardTitle>
                  <CardDescription>This information helps the AI create on-brand content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company LLC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone of Voice</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="playful">Playful</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="pitch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elevator Pitch</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your company in a few sentences." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                      <Label>Brand Assets</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg border border-dashed flex items-center justify-center bg-muted/50">
                          {logoPreview ? (
                            <Image src={logoPreview} alt="Logo preview" width={80} height={80} className="object-contain rounded-lg" />
                          ) : (
                            <UploadCloud className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Brand Logo</p>
                          <p className="text-xs text-muted-foreground">PNG or SVG, up to 2MB.</p>
                          <Button size="sm" variant="outline" type="button" onClick={() => logoInputRef.current?.click()}>
                            {logoPreview ? 'Change' : 'Upload'}
                          </Button>
                          <FormField
                            control={form.control}
                            name="logo"
                            render={() => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="file"
                                    className="hidden"
                                    ref={logoInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/png, image/svg+xml"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input placeholder="#3F51B5" className="max-w-xs" {...field} />
                                </FormControl>
                                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: form.watch('primaryColor') }}></div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                        />
                    </div>

                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" /> AI Brand Brief</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea rows={5} value={brandBrief} readOnly placeholder="Generate a brand brief from your details..." />
                        <Button type="button" className="w-full" onClick={handleGenerateBrief} disabled={isGenerating}>
                          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isGenerating ? "Generating..." : "Generate Brief"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label>Product/Service Catalog</Label>
                    <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg">
                      <FileUp className="w-8 h-8 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="font-medium">Upload Catalog</p>
                        <p className="text-xs text-muted-foreground">Upload a CSV file with product name, price, and description.</p>
                      </div>
                      <Button variant="outline" className="ml-auto" type="button">Upload CSV</Button>
                    </div>
                  </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="connections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>Connect your accounts to enable auto-posting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connections.map((conn) => (
                <Card key={conn.id} className="flex items-center p-4">
                  <Image src={`https://placehold.co/40x40.png`} data-ai-hint={conn.logoHint} alt={conn.name} width={40} height={40} className="rounded-md" />
                  <div className="ml-4 flex-grow">
                    <p className="font-semibold">{conn.name}</p>
                    {conn.connected ? (
                      <p className="text-sm text-green-600">Connected as "{conn.accountName}"</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not Connected</p>
                    )}
                  </div>
                  <Button variant={conn.connected ? "destructive" : "outline"} onClick={() => handleConnectionToggle(conn.id)}>
                    {conn.connected ? null : <LinkIcon className="mr-2 h-4 w-4" />}
                    {conn.connected ? "Disconnect" : "Connect"}
                  </Button>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="knowledge" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Knowledge Base</CardTitle>
              <CardDescription>Add facts for the AI to use in auto-replies (e.g., store hours, return policy).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Textarea 
                        id="kb-fact" 
                        placeholder="e.g., Our return policy is 30 days for a full refund." 
                        value={newFact}
                        onChange={(e) => setNewFact(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddFact())}
                    />
                    <Button onClick={handleAddFact}>Add Fact</Button>
                </div>
                <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium">Existing Facts</h4>
                    <p className="text-sm text-muted-foreground">The AI will use these to answer customer questions.</p>
                    {knowledgeFacts.length > 0 ? (
                        <ul className="space-y-2">
                           {knowledgeFacts.map(fact => (
                               <li key={fact.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 text-sm">
                                   <span>{fact.text}</span>
                                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteFact(fact.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                   </Button>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No facts added yet.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="auto-reply" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Reply Rules</CardTitle>
              <CardDescription>Configure rules for when the AI should automatically reply to comments or messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Reply to Price Inquiries</h4>
                            <p className="text-sm text-muted-foreground">Automatically reply when someone asks about the price.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </Card>
                 <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Reply to Questions about Hours</h4>
                            <p className="text-sm text-muted-foreground">Automatically reply when someone asks about store hours.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </Card>
                 <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Reply to Compliments</h4>
                            <p className="text-sm text-muted-foreground">Automatically thank users for positive comments.</p>
                        </div>
                        <Switch />
                    </div>
                </Card>
                 <div className="pt-4 border-t">
                    <Button>Add New Rule</Button>
                 </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
