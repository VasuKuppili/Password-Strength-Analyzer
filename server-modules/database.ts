/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { UserAccount, PasswordHistoryItem } from '../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

// Memory cache to accelerate lookups
let databaseCache: { users: UserAccount[] } = { users: [] };

/**
 * Initializes the JSON-based lightweight storage engine.
 * Ensures the backing storage file exists and loads cache.
 */
export function initDB() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      databaseCache = JSON.parse(data);
      console.log(`[Database] Loaded ${databaseCache.users.length} users successfully from JSON database file.`);
    } else {
      saveDB();
      console.log('[Database] Initialized new JSON database file.');
    }
  } catch (error) {
    console.error('[Database] Initialization error:', error);
    // Suppress crash but keep cache online in-memory
    databaseCache = { users: [] };
  }
}

/**
 * Flushes database cache to directory file synchronously.
 */
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(databaseCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to write database to disk:', err);
  }
}

/**
 * Finds user account details by case-insensitive matching.
 */
export function findUser(username: string): UserAccount | undefined {
  const normUser = username.trim().toLowerCase();
  return databaseCache.users.find(u => u.username.toLowerCase() === normUser);
}

/**
 * Registers a new user. Performs checks and hashes password.
 */
export function registerUser(username: string, passwordPlain: string): { success: boolean; error?: string } {
  const normUser = username.trim();
  if (!normUser) return { success: false, error: 'Username must not be empty.' };

  const existing = findUser(normUser);
  if (existing) {
    return { success: false, error: 'Username already exists.' };
  }

  // Hash using bcrypt with 10 salt rounds (Key Stretching Standard)
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(passwordPlain, salt);

  const newUser: UserAccount = {
    username: normUser,
    passwordHash,
    history: [
      {
        passwordHash,
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  databaseCache.users.push(newUser);
  saveDB();

  return { success: true };
}

/**
 * Changes a user password. Prevents reuse of previous passwords.
 * Checks against history entries.
 */
export function updatePassword(username: string, passwordPlain: string): { success: boolean; error?: string } {
  const user = findUser(username);
  if (!user) {
    return { success: false, error: 'User not found in system storage.' };
  }

  // Compare candidate password against ALL historic entries in table (preventing reuse)
  // Check active password hash first
  const isCurrentlyUsed = bcrypt.compareSync(passwordPlain, user.passwordHash);
  if (isCurrentlyUsed) {
    return { 
      success: false, 
      error: 'Security Constraint violated: The password you provided is your CURRENT password. Please specify a new, unique password.' 
    };
  }

  // Check older history
  for (const item of user.history) {
    const isMatched = bcrypt.compareSync(passwordPlain, item.passwordHash);
    if (isMatched) {
      return { 
        success: false, 
        error: `Security Constraint violated: This password was previously used on ${new Date(item.timestamp).toLocaleString()}. Password reuse is prohibited to prevent credential rotation exploits.` 
      };
    }
  }

  // If unique, generate fresh hash
  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(passwordPlain, salt);

  // Archive new password in user history array
  const archiveItem: PasswordHistoryItem = {
    passwordHash: newHash,
    timestamp: new Date().toISOString()
  };

  user.passwordHash = newHash;
  user.history.unshift(archiveItem); // Prepend to preserve chronological sequence
  user.updatedAt = new Date().toISOString();

  // Enforce rotation history pool limit of 10 entries to keep it tidy
  if (user.history.length > 10) {
    user.history.pop();
  }

  saveDB();
  return { success: true };
}

/**
 * Returns all active registered users usernames (for dashboard simulation)
 */
export function listUsersSummary(): { username: string; historyCount: number; createdAt: string }[] {
  return databaseCache.users.map(u => ({
    username: u.username,
    historyCount: u.history.length,
    createdAt: u.createdAt
  }));
}
