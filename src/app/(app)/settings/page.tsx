
'use client'

import { useState, useRef, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Bot, FileUp, Link as LinkIcon, UploadCloud, Loader2, Trash2, PlusCircle, Check, Users } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { generateBrandBrief } from "@/ai/flows/generate-brand-brief"
import type { GenerateBrandBriefInput, GenerateBrandBriefOutput } from "@/ai/flows/generate-brand-brief"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const brandProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  pitch: z.string().min(1, "Elevator pitch is required."),
  audience: z.string().min(1, "Target audience is required."),
  sellingPoints: z.array(z.object({ value: z.string().min(1, "Selling point cannot be empty.") })).min(1, "At least one selling point is required."),
  tone: z.object({
    friendly: z.number().min(0).max(100),
    playful: z.number().min(0).max(100),
    simple: z.number().min(0).max(100),
  }),
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

type Plan = 'free' | 'basic' | 'pro';
type Role = 'Owner' | 'Editor';

const plans = [
    {
        name: 'Free',
        id: 'free',
        price: '0 TL',
        price_en: '$0',
        features: ['1 connected account', '10 posts per month', 'Basic analytics'],
        cta: 'Your Current Plan',
        disabled: true,
    },
    {
        name: 'Basic',
        id: 'basic',
        price: '249 TL',
        price_en: '$10',
        features: ['5 connected accounts', '100 posts per month', 'Advanced analytics', 'Auto-reply features'],
        cta: 'Upgrade to Basic',
        disabled: false,
    },
    {
        name: 'Pro',
        id: 'pro',
        price: '749 TL',
        price_en: '$30',
        features: ['Unlimited accounts', 'Unlimited posts', 'Pro analytics suite', 'Priority support'],
        cta: 'Upgrade to Pro',
        disabled: false,
    },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandBrief, setBrandBrief] = useState("");
  const [toneTokens, setToneTokens] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [role, setRole] = useState<Role>('Owner');
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

  const handleSwitchRole = () => {
    const newRole = role === 'Owner' ? 'Editor' : 'Owner';
    setRole(newRole);
    toast({
        title: "Role Switched",
        description: `You are now acting as an ${newRole}. This is a simulated setting.`,
    })
  }

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

  const handlePlanChange = (planId: Plan) => {
    // Simulate POST /billing/checkout-session and a successful webhook update
    console.log(`Simulating checkout for plan: ${planId}`);
    setCurrentPlan(planId);
    toast({
        title: "Plan Updated!",
        description: `You are now on the ${planId} plan.`,
    })
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
    const isConnecting = !connections.find(c => c.id === id)?.connected;
    
    // Simulate API call and success
    setConnections(prev =>
      prev.map(conn =>
        conn.id === id
          ? {
              ...conn,
              connected: !conn.connected,
              // In a real app, this name would come from the OAuth callback
              accountName: !conn.connected ? `Connected ${conn.name}` : undefined,
            }
          : conn
      )
    );

    toast({
        title: `Connection ${isConnecting ? 'Successful' : 'Removed'}`,
        description: `Your ${id} account has been ${isConnecting ? 'connected' : 'disconnected'}.`,
    })
  };

  const form = useForm<BrandProfileFormValues>({
    resolver: zodResolver(brandProfileSchema),
    // Simulate GET /brand
    defaultValues: {
      companyName: "Artisanal Coffee Istanbul",
      pitch: "A cozy and friendly cafe in Istanbul, known for its artisanal coffee and homemade pastries. We want to be seen as a neighborhood gem.",
      audience: "Young professionals and students in Istanbul who appreciate high-quality coffee and a relaxing atmosphere.",
      sellingPoints: [
        { value: "Specialty-grade, single-origin coffee beans" },
        { value: "Freshly baked homemade pastries daily" },
        { value: "Cozy ambiance with free Wi-Fi" },
        { value: "Located in the heart of Kadıköy" },
      ],
      tone: {
          friendly: 80,
          playful: 40,
          simple: 70,
      },
      primaryColor: "#3F51B5",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sellingPoints",
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
        // This simulates POST /assets and getting back a URL.
        const dataUri = reader.result as string;
        setLogoPreview(dataUri);
        // This sets the value in the form to be sent in PUT /brand
        form.setValue("logo", dataUri); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBrief = async () => {
    const values = form.getValues();
    const validation = await form.trigger(["companyName", "pitch", "tone", "audience"]);

    if (!validation) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please complete all fields in the Brand Identity section before generating a brief.",
        });
        return;
    }

    setIsGenerating(true);
    setBrandBrief("");

    try {
      const input: GenerateBrandBriefInput = {
          companyProfile: `${values.companyName}: ${values.pitch}`,
          audience: values.audience,
          tone: values.tone,
      };
      const result: GenerateBrandBriefOutput = await generateBrandBrief(input);
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

  // Simulate PUT /brand
  const onSubmit = (data: BrandProfileFormValues) => {
    console.log("Simulating PUT /api/v1/brand with data:", data)
    // In a real app, this would also save this data to a global state/context
    // so the planner page can access it.
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

       <Card className="border-l-4 border-primary">
            <CardHeader className="flex flex-row items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Role-Based Access Control</CardTitle>
                    <CardDescription>
                       You are currently acting as an <span className="font-bold text-primary">{role}</span>. Editors have restricted access to sensitive settings.
                    </CardDescription>
                </div>
                 <Button variant="outline" size="sm" className="ml-auto" onClick={handleSwitchRole}>
                    Switch to {role === 'Owner' ? 'Editor' : 'Owner'}
                </Button>
            </CardHeader>
        </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Brand Profile</TabsTrigger>
          <TabsTrigger value="connections" disabled={role === 'Editor'}>Connections</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="auto-reply">Auto-Reply</TabsTrigger>
          <TabsTrigger value="billing" disabled={role === 'Editor'}>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Brand Identity</CardTitle>
                      <CardDescription>This core information defines your brand's voice and personality.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                        name="pitch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Elevator Pitch</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe your company in a few sentences." {...field} />
                            </FormControl>
                             <FormDescription>What makes your business unique? What's your mission?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="audience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <FormControl>
                              <Textarea placeholder="e.g., Young professionals in Istanbul who appreciate handcrafted goods and a cozy atmosphere." {...field} />
                            </FormControl>
                            <FormDescription>Describe your ideal customer.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                   <Card>
                    <CardHeader>
                        <CardTitle>Products & Services</CardTitle>
                        <CardDescription>List your key offerings for the AI to use in content generation. This corresponds to the `selling_points` in your brand profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                           <FormField
                            key={field.id}
                            control={form.control}
                            name={`sellingPoints.${index}.value`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Selling Point {index + 1}</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input {...field} placeholder={`Product or Service ${index + 1}`}/>
                                        </FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ value: "" })}
                            >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Selling Point
                        </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tone of Voice</CardTitle>
                      <CardDescription>Adjust the sliders to match your brand's personality.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                         <FormField
                            control={form.control}
                            name="tone.friendly"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Friendly</FormLabel>
                                    <div className="flex justify-between text-xs text-muted-foreground"><span>Formal</span><span>Friendly</span></div>
                                    <FormControl>
                                        <Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={100} step={1} />
                                    </FormControl>
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="tone.playful"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Playful</FormLabel>
                                    <div className="flex justify-between text-xs text-muted-foreground"><span>Serious</span><span>Playful</span></div>
                                    <FormControl>
                                        <Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={100} step={1} />
                                    </FormControl>
                                </FormItem>
                            )}
                         />
                          <FormField
                            control={form.control}
                            name="tone.simple"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Simple</FormLabel>
                                    <div className="flex justify-between text-xs text-muted-foreground"><span>Detailed</span><span>Simple</span></div>
                                    <FormControl>
                                        <Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={100} step={1} />
                                    </FormControl>
                                </FormItem>
                            )}
                         />
                    </CardContent>
                  </Card>
                  
                  <Card>
                     <CardHeader>
                        <CardTitle>Brand Assets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                            <p className="text-xs text-muted-foreground">PNG, max 2MB.</p>
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
                                        accept="image/png"
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
                         <div className="space-y-2">
                            <Label>Product Catalog</Label>
                            <div className="flex items-center gap-4 p-4 border border-dashed rounded-lg bg-muted/50">
                            <FileUp className="w-8 h-8 text-muted-foreground" />
                            <div className="space-y-1">
                                <p className="font-medium">Upload Catalog (Optional)</p>
                                <p className="text-xs text-muted-foreground">Upload a CSV with product info.</p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto" type="button">Upload</Button>
                            </div>
                        </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base"><Bot className="w-5 h-5" /> AI Brand Brief</CardTitle>
                      <CardDescription className="text-xs">Generate a brief from your details to guide the AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Textarea rows={6} value={brandBrief} readOnly placeholder="Click 'Generate Brief' after filling out your Brand Identity details." />
                      <Button type="button" className="w-full" onClick={handleGenerateBrief} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isGenerating ? "Generating..." : "Generate Brief"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Separator/>
              <div className="flex justify-end">
                <Button type="submit">Save All Changes</Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="connections" className="mt-6">
           {role === 'Editor' && (
              <Alert variant="destructive" className="mb-6">
                <Users className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                  You do not have permission to manage connections. Please contact an Owner.
                </AlertDescription>
              </Alert>
           )}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Connections</CardTitle>
              <CardDescription>Connect your accounts to enable auto-posting and manual reconnect.</CardDescription>
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
                  <Button variant={conn.connected ? "destructive" : "outline"} onClick={() => handleConnectionToggle(conn.id)} disabled={role === 'Editor' && conn.id === 'instagram'}>
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

        <TabsContent value="billing" className="mt-6">
            {role === 'Editor' && (
              <Alert variant="destructive" className="mb-6">
                <Users className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                  You do not have permission to manage billing. Please contact an Owner.
                </AlertDescription>
              </Alert>
           )}
            <Card>
                <CardHeader>
                    <CardTitle>Billing & Plan</CardTitle>
                    <CardDescription>Manage your subscription and payment details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={cn("flex flex-col", currentPlan === plan.id && "border-primary")}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    disabled={currentPlan === plan.id || role === 'Editor'}
                                    onClick={() => handlePlanChange(plan.id as Plan)}
                                >
                                    {currentPlan === plan.id ? 'Current Plan' : plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
                 <CardFooter className="flex justify-between items-center border-t pt-6">
                    <div className="text-sm text-muted-foreground">
                        <p>For questions or to cancel your plan, please contact support.</p>
                    </div>
                    <Button variant="outline">Contact Support</Button>
                </CardFooter>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
