/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StrengthCategory = 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface RequirementCheck {
  id: string;
  label: string;
  met: boolean;
  type: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
}

export interface PasswordAnalysis {
  password: string;
  score: number; // 0 to 100
  entropy: number; // bits
  category: StrengthCategory;
  checks: RequirementCheck[];
  commonPasswordMatch: boolean;
  dictionaryName?: string;
  recommendations: string[];
  crackTimeEstimate: string;
}

export interface GeneratedPasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSpecial: boolean;
}

export interface PasswordHistoryItem {
  timestamp: string;
  passwordHash: string;
}

export interface UserAccount {
  username: string;
  passwordHash: string;
  history: PasswordHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

export interface AnalyzeRequest {
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  username: string;
  oldPassword?: string;
  newPassword: string;
}

export interface ResponseWithUser {
  message: string;
  username: string;
  historyCount: number;
}
