// src/context/AppDataContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Template } from '@/app/templates/page'; // Reuse Template type
import type { Recipient } from '@/app/recipients/page'; // Reuse Recipient type

// Initial data (can be moved or fetched later)
const initialRecipientsData: Recipient[] = [
  { id: '1', firstName: 'Aisha', email: 'aisha.sharma@innovatech.com', organization: 'Innovatech Solutions', achievement: 'Secured $50M Series B funding', role: 'CEO', status: 'Not Invited', lastContacted: null },
  { id: '2', firstName: 'Rohan', email: 'rohan.mehta@finserve.co', organization: 'FinServe Dynamics', achievement: 'Launched new fintech platform', role: 'CTO', status: 'Invited', lastContacted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: '3', firstName: 'Priya', email: 'priya.patel@greenenergy.org', organization: 'GreenEnergy Foundation', achievement: 'Led $100M solar project initiative', role: 'Director', status: 'Follow-up 1', lastContacted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  { id: '4', firstName: 'Vikram', email: 'vikram.singh@healthplus.ai', organization: 'HealthPlus AI', achievement: 'Developed AI diagnostic tool', role: 'Lead Researcher', status: 'RSVPed', lastContacted: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
  { id: '5', firstName: 'Sunita', email: 'sunita.rao@edutechglobal.com', organization: 'EduTech Global', achievement: 'Expanded operations to 5 new countries', role: 'COO', status: 'Not Invited', lastContacted: null },
];

const initialTemplatesData: Template[] = [
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


interface AppDataContextType {
  recipients: Recipient[];
  addRecipients: (newRecipients: Omit<Recipient, 'id' | 'status' | 'lastContacted'>[]) => void;
  updateRecipient: (updatedRecipient: Recipient) => void;
  deleteRecipients: (idsToDelete: Set<string>) => void;
  templates: Template[];
  updateTemplate: (updatedTemplate: Template) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Load initial data on mount (client-side only)
  useEffect(() => {
    setRecipients(initialRecipientsData);
    setTemplates(initialTemplatesData);
  }, []);

  const addRecipients = useCallback((newRecipients: Omit<Recipient, 'id' | 'status' | 'lastContacted'>[]) => {
    setRecipients(prev => [
      ...prev,
      ...newRecipients.map((r, index) => ({
        ...r,
        id: `new-${Date.now()}-${index}`, // Simple unique ID generation
        status: 'Not Invited' as const,
        lastContacted: null,
      })),
    ]);
  }, []);

  const updateRecipient = useCallback((updatedRecipient: Recipient) => {
    setRecipients(prev =>
      prev.map(r => (r.id === updatedRecipient.id ? updatedRecipient : r))
    );
  }, []);

  const deleteRecipients = useCallback((idsToDelete: Set<string>) => {
    setRecipients(prev => prev.filter(r => !idsToDelete.has(r.id)));
  }, []);

  const updateTemplate = useCallback((updatedTemplate: Template) => {
    setTemplates(prev =>
      prev.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  }, []);

  const value = {
    recipients,
    addRecipients,
    updateRecipient,
    deleteRecipients,
    templates,
    updateTemplate,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
