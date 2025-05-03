'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestEmailEdits } from '@/ai/flows/suggest-email-edits';

// Placeholder recipient data structure - use real data source in production
const sampleRecipientData = {
    FirstName: "Aisha",
    Email: "aisha.sharma@innovatech.com",
    Organization: "Innovatech Solutions",
    Achievement: "Secured $50M Series B funding",
    Role: "CEO"
};

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const initialTemplates: Template[] = [
  {
    id: 'invitation',
    name: 'Initial Invitation',
    subject: '{FirstName}, Join Us at Viksit Bharat Dialogues & Awards 2025',
    body: `Dear {FirstName},\n\nYour {Achievement}, announced in [Source, e.g., Business Standard, March 2025], is creating jobs and boosting India’s economy. We admire your commitment to a stronger India, aligning with Viksit Bharat 2047.\n\nThe Bharat Economic Forum (BEF) invites you to the Viksit Bharat Dialogues & Awards (VBDA) on 25th July 2025 at Bharat Mandapam, New Delhi. VBDA celebrates leaders like you, uniting 500+ innovators and policymakers to shape a $30 trillion economy.\n\nParticipating in VBDA lets you network with CEOs and ministers, share your vision with 5M+ people via our media, and position {Organization} as a key contributor to India’s growth. Be a speaker, VIP, or awardee to amplify your impact.\n\nCan we schedule a 15-minute call to discuss your role in VBDA? Contact me at contact@bharateconomicforum.org or +91 8744089014. Visit https://www.bharateconomicforum.org/viksit-bharat-dialogues for details.\n\nWarm regards,\nManish Patel\nFounder & Chairman, BEF`,
  },
  {
    id: 'followup1',
    name: 'Follow-Up (5 days)',
    subject: '{FirstName}, Don’t Miss VBDA 2025!',
    body: `Dear {FirstName},\n\nI’m following up on our invitation to the Viksit Bharat Dialogues & Awards (VBDA) on 25th July 2025. Your {Achievement} makes you a perfect fit to join 500+ leaders shaping India’s $30T economy. With limited seats, don’t miss networking with policymakers and gaining 5M+ media reach.\n\nLet’s discuss your participation in a quick call. Reach me at contact@bharateconomicforum.org or +91 8744089014.\n\nBest,\nManish Patel\nFounder & Chairman, BEF`,
  },
   {
    id: 'followup2',
    name: 'Final Reminder (10 days)',
    subject: 'Final Reminder: {FirstName}, Limited Seats for VBDA 2025',
    body: `Dear {FirstName},\n\nThis is a final reminder about the Viksit Bharat Dialogues & Awards (VBDA) on 25th July 2025. Seats are filling up fast!\n\nAs a leader contributing to India's growth through initiatives like your {Achievement}, your presence would be invaluable.\n\nRSVP soon to secure your place among top policymakers and industry pioneers. Visit https://www.bharateconomicforum.org/viksit-bharat-dialogues or reply to this email.\n\nRegards,\nManish Patel\nFounder & Chairman, BEF`,
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplates[0].id);
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentBody, setCurrentBody] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<{ subject: string, body: string, explanation: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

   useEffect(() => {
     const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
     if (selectedTemplate) {
       setCurrentSubject(selectedTemplate.subject);
       setCurrentBody(selectedTemplate.body);
       setAiSuggestion(null); // Clear suggestions when template changes
     }
   }, [selectedTemplateId, templates]);

   const handleTemplateChange = (value: string) => {
       setSelectedTemplateId(value);
   };

   const handleSaveTemplate = async () => {
       setIsSaving(true);
       // Simulate saving to backend
       await new Promise(resolve => setTimeout(resolve, 1000));

       setTemplates(prevTemplates =>
         prevTemplates.map(t =>
           t.id === selectedTemplateId ? { ...t, subject: currentSubject, body: currentBody } : t
         )
       );

       setIsSaving(false);
       toast({ title: 'Template Saved', description: `Template "${templates.find(t=>t.id === selectedTemplateId)?.name}" has been updated.` });
   };

   const handleGetAiSuggestions = async () => {
     setIsAiLoading(true);
     setAiSuggestion(null);
     try {
        const currentTemplateContent = `Subject: ${currentSubject}\n\n${currentBody}`;
        const result = await suggestEmailEdits({
            emailTemplate: currentTemplateContent,
            recipientData: sampleRecipientData // Using sample data for suggestion
        });

        // Basic parsing assuming the AI returns Subject: ... Body: ...
         const editedParts = result.editedEmailTemplate.split('\n\n');
         const suggestedSubject = editedParts.find(part => part.startsWith('Subject:'))?.replace('Subject:', '').trim() || currentSubject;
         const suggestedBody = editedParts.filter(part => !part.startsWith('Subject:')).join('\n\n').trim() || currentBody;


        setAiSuggestion({
            subject: suggestedSubject,
            body: suggestedBody,
            explanation: result.explanation
        });

        toast({ title: 'AI Suggestions Ready', description: 'Review the suggestions provided by the AI.' });
     } catch (error) {
       console.error('Error getting AI suggestions:', error);
       toast({ title: 'AI Suggestion Error', description: 'Could not fetch AI suggestions. Please try again.', variant: 'destructive' });
     } finally {
       setIsAiLoading(false);
     }
   };

   const applyAiSuggestion = () => {
     if (aiSuggestion) {
       setCurrentSubject(aiSuggestion.subject);
       setCurrentBody(aiSuggestion.body);
       setAiSuggestion(null); // Clear suggestion after applying
       toast({ title: 'AI Suggestion Applied', description: 'The suggested changes have been applied to the editor.' });
     }
   };


  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Email Templates</h1>
        <p className="text-muted-foreground">Manage and edit your invitation and follow-up email templates.</p>
      </header>

       <Card className="card-shadow rounded-corners">
         <CardHeader>
           <CardTitle>Edit Template</CardTitle>
           <CardDescription>Select a template to edit or use AI to suggest improvements.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">
           <div className="w-full md:w-1/2 lg:w-1/3">
              <Label htmlFor="template-select">Select Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="template-select">
                      <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                      {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                              {template.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
           </div>

           <Tabs defaultValue="editor" className="w-full">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="editor">Editor</TabsTrigger>
               <TabsTrigger value="preview">Preview (with Sample Data)</TabsTrigger>
             </TabsList>
             <TabsContent value="editor" className="space-y-4 mt-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        value={currentSubject}
                        onChange={(e) => setCurrentSubject(e.target.value)}
                        placeholder="Enter email subject"
                    />
                </div>
               <div className="space-y-2">
                 <Label htmlFor="body">Body</Label>
                 <Textarea
                   id="body"
                   value={currentBody}
                   onChange={(e) => setCurrentBody(e.target.value)}
                   placeholder="Enter email body. Use placeholders like {FirstName}, {Achievement}, {Organization}, {Role}."
                   rows={15}
                   className="min-h-[300px]"
                 />
                 <p className="text-xs text-muted-foreground">
                    Available placeholders: {'{FirstName}'}, {'{Email}'}, {'{Organization}'}, {'{Achievement}'}, {'{Role}'}
                 </p>
               </div>

                <div className="flex gap-2">
                   <Button onClick={handleGetAiSuggestions} disabled={isAiLoading}>
                     {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                     Get AI Suggestions
                   </Button>
                   <Button onClick={handleSaveTemplate} disabled={isSaving}>
                     {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                     Save Template
                   </Button>
                </div>

                {aiSuggestion && (
                    <Card className="mt-4 bg-secondary border-accent">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="text-accent"/> AI Suggestions</CardTitle>
                            <CardDescription>{aiSuggestion.explanation}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                               <Label className="font-semibold">Suggested Subject:</Label>
                               <p className="text-sm p-2 border rounded bg-background">{aiSuggestion.subject}</p>
                           </div>
                            <div>
                                <Label className="font-semibold">Suggested Body:</Label>
                                <pre className="text-sm p-2 border rounded whitespace-pre-wrap bg-background font-sans max-h-60 overflow-auto">{aiSuggestion.body}</pre>
                           </div>
                        </CardContent>
                         <CardFooter>
                            <Button onClick={applyAiSuggestion} variant="default" className="bg-accent hover:bg-accent/90">Apply Suggestion</Button>
                             <Button onClick={() => setAiSuggestion(null)} variant="outline" className="ml-2">Discard</Button>
                         </CardFooter>
                    </Card>
                )}


             </TabsContent>
             <TabsContent value="preview" className="mt-4 space-y-4">
                <div className="p-4 border rounded bg-background">
                     <p className="font-semibold text-sm mb-1">Subject:</p>
                     <p className="text-sm">{currentSubject.replace(/{(\w+)}/g, (match, key) => sampleRecipientData[key as keyof typeof sampleRecipientData] || match)}</p>
                </div>
                <div className="p-4 border rounded bg-background">
                     <p className="font-semibold text-sm mb-1">Body:</p>
                     <pre className="text-sm whitespace-pre-wrap font-sans">
                         {currentBody.replace(/{(\w+)}/g, (match, key) => sampleRecipientData[key as keyof typeof sampleRecipientData] || match)}
                     </pre>
                </div>
             </TabsContent>
           </Tabs>
         </CardContent>
       </Card>
    </div>
  );
}
