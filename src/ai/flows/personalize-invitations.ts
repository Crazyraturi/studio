// src/ai/flows/personalize-invitations.ts
'use server';

/**
 * @fileOverview A flow for generating personalized invitation emails.
 *
 * - personalizeInvitation - A function that handles the email personalization process.
 * - PersonalizeInvitationInput - The input type for the personalizeInvitation function.
 * - PersonalizeInvitationOutput - The return type for the personalizeInvitation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getRecentNews, NewsArticle} from '@/services/news-api';

const PersonalizeInvitationInputSchema = z.object({
  firstName: z.string().describe('The first name of the recipient.'),
  email: z.string().email().describe('The email address of the recipient.'),
  organization: z.string().describe('The organization the recipient belongs to.'),
  achievement: z.string().describe('A recent achievement of the recipient.'),
  role: z.string().describe('The role of the recipient.'),
});
export type PersonalizeInvitationInput = z.infer<typeof PersonalizeInvitationInputSchema>;

const PersonalizeInvitationOutputSchema = z.object({
  subject: z.string().describe('The personalized subject line for the invitation email.'),
  body: z.string().describe('The personalized body of the invitation email.'),
});
export type PersonalizeInvitationOutput = z.infer<typeof PersonalizeInvitationOutputSchema>;

export async function personalizeInvitation(
  input: PersonalizeInvitationInput
): Promise<PersonalizeInvitationOutput> {
  return personalizeInvitationFlow(input);
}

const personalizeInvitationPrompt = ai.definePrompt({
  name: 'personalizeInvitationPrompt',
  input: {
    schema: z.object({
      firstName: z.string().describe('The first name of the recipient.'),
      email: z.string().email().describe('The email address of the recipient.'),
      organization: z.string().describe('The organization the recipient belongs to.'),
      achievement: z.string().describe('A recent achievement of the recipient.'),
      role: z.string().describe('The role of the recipient.'),
      newsSnippet: z.string().describe('A snippet of recent news about the organization'),
    }),
  },
  output: {
    schema: z.object({
      subject: z.string().describe('The personalized subject line for the invitation email.'),
      body: z.string().describe('The personalized body of the invitation email.'),
    }),
  },
  prompt: `You are an expert email marketer specializing in crafting personalized invitation emails for high-profile events. Your goal is to create engaging and relevant content that resonates with each recipient, making them more likely to attend.  You will generate both a subject and body for the email.

  Consider the recipient's name, organization, recent achievements, and role, incorporate the company's recent news to craft compelling subject lines and email bodies.

  Here is the recipient's information:
  First Name: {{{firstName}}}
  Email: {{{email}}}
  Organization: {{{organization}}}
  Achievement: {{{achievement}}}
  Role: {{{role}}}
  News Snippet: {{{newsSnippet}}}

  Please generate a personalized subject line and email body that highlights their achievements and the benefits of attending the Viksit Bharat Dialogues & Awards (VBDA) event on 25th July 2025 at Bharat Mandapam, New Delhi. The VBDA celebrates leaders and contributors to India’s economic growth.

  Subject:  (Concise, attention-grabbing subject line)
  Body: (Personalized email content.  Be sure to include a call to action to encourage the recipient to RSVP or learn more.)`,
});

const personalizeInvitationFlow = ai.defineFlow<
  typeof PersonalizeInvitationInputSchema,
  typeof PersonalizeInvitationOutputSchema
>({
  name: 'personalizeInvitationFlow',
  inputSchema: PersonalizeInvitationInputSchema,
  outputSchema: PersonalizeInvitationOutputSchema,
},
async input => {
  let news: NewsArticle[] = [];
  try {
     news = await getRecentNews(input.organization);
  } catch (e) {
    console.error("error calling news api", e);
  }

  const newsSnippet = news.length > 0 ? news[0].description : "";

  const {output} = await personalizeInvitationPrompt({
    ...input,
    newsSnippet,
  });
  return output!;
});
