
import React from 'react';

export enum PartyType {
  SMOKE = 'SMOKE',
  MEAL = 'MEAL',
  COFFEE = 'COFFEE'
}

export enum PartyStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum MealMode {
  FIXED = 'FIXED',
  VOTE = 'VOTE'
}

export interface User {
  uid: string;
  displayName: string;
  avatarUrl?: string;
}

export interface VoteOption {
  id: string;
  name: string;
  votes: string[]; // array of user UIDs
}

export interface Party {
  id: string;
  type: PartyType;
  status: PartyStatus;
  creatorId: string;
  creatorName: string;
  createdAt: number;
  meetTime: number; // timestamp
  location: string;
  description?: string;
  participants: string[]; // array of user UIDs
  participantNames?: Record<string, string>; // Mapping of UID to DisplayName
  
  // Menu Orders (Used mainly for Coffee)
  orders?: Record<string, string>; // Map of UID to menu item string

  // Meal specific
  mealMode?: MealMode;
  fixedMenu?: string;
  voteOptions?: VoteOption[];
  allowAddOption?: boolean;
}

export interface TabItem {
  id: 'ALL' | 'SMOKE' | 'MEAL' | 'COFFEE' | 'SETTINGS';
  label: string;
  icon: React.ComponentType<any>;
}
