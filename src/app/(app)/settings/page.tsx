
'use client'

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Bot, FileUp, Link as LinkIcon, UploadCloud, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { generateBrandBrief, GenerateBrandBriefInput } from "@/ai/flows/generate-brand-brief"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const brandProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  tone: z.string().min(1, "Tone of voice is required."),
  pitch: z.string().min(1, "Elevator pitch is required."),
  logo: z.any().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color."),
  catalog: z.any().optional(),
});

type BrandProfileFormValues = z.infer<typeof brandProfileSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandBrief, setBrandBrief] = useState("");
  const [toneTokens, setToneTokens] = useState("");

  const form = useForm<BrandProfileFormValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      companyName: "",
      tone: "friendly",
      pitch: "",
      primaryColor: "#3F51B5",
    },
  });

  const handleGenerateBrief = async () => {
    const values = form.getValues();
    const validation = form.trigger(["companyName", "pitch", "tone"]);

    if (!await validation) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out Company Name, Tone, and Elevator Pitch before generating a brief.",
        });
        return;
    }

    setIsGenerating(true);
    setBrandBrief("");
    setToneTokens("");

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Brand Profile</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        <div className="w-20 h-20 rounded-lg border border-dashed flex items-center justify-center">
                          <UploadCloud className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">Brand Logo</p>
                          <p className="text-xs text-muted-foreground">PNG or SVG, up to 2MB.</p>
                          <Button size="sm" variant="outline" type="button">Upload</Button>
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
                        <CardTitle className="flex items-center gap-2 text-base"><Bot className="w-5 h-5" /> AI Brand Brief</CardTitle>
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

                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </CardContent>
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
              <Card className="flex items-center p-4">
                <Image src="https://placehold.co/40x40.png" data-ai-hint="instagram logo" alt="Instagram" width={40} height={40} className="rounded-md" />
                <div className="ml-4 flex-grow">
                  <p className="font-semibold">Instagram Business</p>
                  <p className="text-sm text-muted-foreground">Not Connected</p>
                </div>
                <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" />Connect</Button>
              </Card>
              <Card className="flex items-center p-4">
                <Image src="https://placehold.co/40x40.png" data-ai-hint="facebook logo" alt="Facebook" width={40} height={40} className="rounded-md" />
                <div className="ml-4 flex-grow">
                  <p className="font-semibold">Facebook Page</p>
                  <p className="text-sm text-green-600">Connected as "My Biz Page"</p>
                </div>
                 <Button variant="destructive">Disconnect</Button>
              </Card>
              <Card className="flex items-center p-4">
                <Image src="https://placehold.co/40x40.png" data-ai-hint="linkedin logo" alt="LinkedIn" width={40} height={40} className="rounded-md" />
                <div className="ml-4 flex-grow">
                  <p className="font-semibold">LinkedIn Company Page</p>
                  <p className="text-sm text-muted-foreground">Not Connected</p>
                </div>
                <Button variant="outline"><LinkIcon className="mr-2 h-4 w-4" />Connect</Button>
              </Card>
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
                <div className="space-y-2">
                    <Label htmlFor="kb-fact">New Fact</Label>
                    <Textarea id="kb-fact" placeholder="e.g., Our return policy is 30 days for a full refund." />
                </div>
                <Button>Add Fact</Button>
                <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium">Existing Facts</h4>
                    <p className="text-sm text-muted-foreground">The AI will use these to answer customer questions.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Store hours are 9am-6pm on weekdays, 10am-4pm on weekends.</li>
                        <li>We are located at 123 Main St, Istanbul.</li>
                        <li>We offer free shipping on all orders over 500 TL.</li>
                    </ul>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
