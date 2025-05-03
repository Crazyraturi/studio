// src/app/templates/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { useAppData } from '@/context/AppDataContext'; // Import useAppData

// Sample recipient data for preview/AI suggestion context
const sampleRecipientData = {
    FirstName: "Aisha",
    Email: "aisha.sharma@innovatech.com",
    Organization: "Innovatech Solutions",
    Achievement: "Secured $50M Series B funding",
    Role: "CEO"
};

// Define Template type here or import if defined centrally
export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}


export default function TemplatesPage() {
  const { templates, updateTemplate } = useAppData(); // Get templates and update action from context
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentBody, setCurrentBody] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<{ subject: string, body: string, explanation: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize selected template ID when templates load
   useEffect(() => {
     if (templates.length > 0 && !selectedTemplateId) {
       setSelectedTemplateId(templates[0].id);
     }
   }, [templates, selectedTemplateId]);

   // Update local editor state when selectedTemplateId changes or templates data updates
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
       const templateToSave = templates.find(t => t.id === selectedTemplateId);
       if (!templateToSave) {
            toast({ title: 'Error', description: 'Selected template not found.', variant: 'destructive'});
            return;
       }

       setIsSaving(true);
       // Simulate saving to backend (optional delay)
       await new Promise(resolve => setTimeout(resolve, 500));

       updateTemplate({ // Call context update action
            ...templateToSave,
            subject: currentSubject,
            body: currentBody
       });

       setIsSaving(false);
       toast({ title: 'Template Saved', description: `Template "${templateToSave.name}" has been updated.` });
   };

   const handleGetAiSuggestions = async () => {
     setIsAiLoading(true);
     setAiSuggestion(null);
     try {
        const currentTemplateContent = `Subject: ${currentSubject}\n\n${currentBody}`;
        const result = await suggestEmailEdits({
            emailTemplate: currentTemplateContent,
            recipientData: sampleRecipientData // Using sample data for suggestion context
        });

        // Robust parsing for Subject and Body from AI response
         let suggestedSubject = currentSubject;
         let suggestedBody = currentBody;
         const subjectMatch = result.editedEmailTemplate.match(/^Subject:(.*?)(\n\n|$)/is);
         if (subjectMatch && subjectMatch[1]) {
            suggestedSubject = subjectMatch[1].trim();
            // Remove the subject line from the rest of the body content
            suggestedBody = result.editedEmailTemplate.replace(/^Subject:.*?\n\n?/is, '').trim();
         } else {
             // If no "Subject:" prefix found, assume the whole edited template is the body
             suggestedBody = result.editedEmailTemplate.trim();
         }


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

   // Memoized preview content
    const previewContent = useMemo(() => {
        let subject = currentSubject;
        let body = currentBody;
        Object.keys(sampleRecipientData).forEach(key => {
            const placeholder = `{${key}}`;
            const value = sampleRecipientData[key as keyof typeof sampleRecipientData] || '';
            subject = subject.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), value);
            body = body.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), value);
        });
        return { subject, body };
    }, [currentSubject, currentBody]);


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
           {templates.length > 0 ? (
            <>
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
                            disabled={!selectedTemplateId}
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
                      disabled={!selectedTemplateId}
                    />
                    <p className="text-xs text-muted-foreground">
                        Available placeholders: {'{FirstName}'}, {'{Email}'}, {'{Organization}'}, {'{Achievement}'}, {'{Role}'}
                    </p>
                  </div>

                    <div className="flex gap-2">
                      <Button onClick={handleGetAiSuggestions} disabled={isAiLoading || !selectedTemplateId}>
                        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Get AI Suggestions
                      </Button>
                      <Button onClick={handleSaveTemplate} disabled={isSaving || !selectedTemplateId}>
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
                        <p className="text-sm">{previewContent.subject}</p>
                    </div>
                    <div className="p-4 border rounded bg-background">
                        <p className="font-semibold text-sm mb-1">Body:</p>
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                            {previewContent.body}
                        </pre>
                    </div>
                </TabsContent>
              </Tabs>
            </>
           ) : (
             <p className="text-muted-foreground">No email templates available. Add templates to begin.</p>
           )}
         </CardContent>
       </Card>
    </div>
  );
}
