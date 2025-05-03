'use server';
/**
 * @fileOverview A flow that suggests edits to email templates based on best practices and recipient data.
 *
 * - suggestEmailEdits - A function that takes an email template and recipient data and returns suggested edits.
 * - SuggestEmailEditsInput - The input type for the suggestEmailEdits function.
 * - SuggestEmailEditsOutput - The return type for the suggestEmailEdits function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestEmailEditsInputSchema = z.object({
  emailTemplate: z
    .string()
    .describe('The email template to be edited.'),
  recipientData: z.record(z.any()).describe('Recipient data to personalize the email.'),
});
export type SuggestEmailEditsInput = z.infer<typeof SuggestEmailEditsInputSchema>;

const SuggestEmailEditsOutputSchema = z.object({
  editedEmailTemplate: z
    .string()
    .describe('The email template with suggested edits.'),
  explanation: z.string().describe('Explanation of the changes made to the email.'),
});
export type SuggestEmailEditsOutput = z.infer<typeof SuggestEmailEditsOutputSchema>;

export async function suggestEmailEdits(input: SuggestEmailEditsInput): Promise<SuggestEmailEditsOutput> {
  return suggestEmailEditsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEmailEditsPrompt',
  input: {
    schema: z.object({
      emailTemplate: z
        .string()
        .describe('The email template to be edited.'),
      recipientData: z.record(z.any()).describe('Recipient data to personalize the email.'),
    }),
  },
  output: {
    schema: z.object({
      editedEmailTemplate: z
        .string()
        .describe('The email template with suggested edits.'),
      explanation: z.string().describe('Explanation of the changes made to the email.'),
    }),
  },
  prompt: `You are an AI assistant specialized in providing suggestions on how to improve email templates based on best practices and provided recipient data.

  Here is the email template: {{{emailTemplate}}}
  Here is the recipient data: {{{recipientData}}}

  Please provide an edited email template with clear improvements.
  Also, include a brief explanation of the changes made and the reasoning behind them.
  Make sure that the edited email template includes personalized content based on recipient data.
  Follow email marketing best practices.
  `,
});

const suggestEmailEditsFlow = ai.defineFlow<
  typeof SuggestEmailEditsInputSchema,
  typeof SuggestEmailEditsOutputSchema
>({
  name: 'suggestEmailEditsFlow',
  inputSchema: SuggestEmailEditsInputSchema,
  outputSchema: SuggestEmailEditsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
}
);
