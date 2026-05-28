/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PasswordAnalysis, RequirementCheck, StrengthCategory, GeneratedPasswordOptions } from '../types';

// Embedded common passwords list for instant client-side checking
// These match the contents of our dictionary file for instant local analysis.
const COMMON_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "qwerty", "1234567",
  "google", "letmein", "letmein1", "admin", "admin123", "root", "welcome",
  "football", "charlie", "monkey", "dragon", "shadow", "princess", "superman",
  "mustang", "michael", "andrew", "jessica", "ashley", "taylor", "matthew",
  "hunter", "joshua", "samantha", "cookies", "awesome", "iloveyou", "sunshine",
  "secret", "pussycat", "beautiful", "freedom", "warrior", "phoenix", "whiskey",
  "tequila", "scuba", "marlo", "p@ssword", "123123", "111111", "654321", "000000",
  "1234567890", "asdfghjkl", "qwertyuiop", "zxcvbnm", "letmeout", "pass123",
  "login", "user123", "changeme", "pass", "key123", "guest", "system", "oracle",
  "database", "cisco", "support", "operator", "default", "manager", "master",
  "security", "service", "server", "testing", "developer", "test123",
  "password123", "123password", "987654321", "qwerty123", "admin!23", "password!",
  "letmein123", "welcome1", "welcome123", "dragonfly", "butterfly"
];

/**
 * Calculates the Shannon password entropy: E = L * log2(R)
 * L: Password length
 * R: Character pool size
 */
export function calculateEntropy(password: string): { entropy: number; poolSize: number } {
  const L = password.length;
  if (L === 0) return { entropy: 0, poolSize: 0 };

  let poolSize = 0;
  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSpecial = false;

  for (let i = 0; i < L; i++) {
    const char = password[i];
    if (/[a-z]/.test(char)) hasLower = true;
    else if (/[A-Z]/.test(char)) hasUpper = true;
    else if (/[0-9]/.test(char)) hasDigit = true;
    else hasSpecial = true;
  }

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSpecial) poolSize += 33; // 33 standard special characters

  if (poolSize === 0) return { entropy: 0, poolSize: 0 };

  // E = L * Log2(R)
  const entropy = L * (Math.log(poolSize) / Math.log(2));
  return { entropy, poolSize };
}

/**
 * Estimate brute force cracking time based on entropy,
 * assuming a powerful GPU cluster testing 100 Billion passes per second (1e11).
 */
export function getCrackTimeEstimate(entropy: number): string {
  if (entropy === 0) return "Instantly";

  const numGuesses = Math.pow(2, entropy);
  const guessesPerSecond = 1e11; // 100 Billion guesses/sec
  const secondsToCrack = numGuesses / guessesPerSecond;

  if (secondsToCrack < 1) {
    return "Instantly (under 1 second)";
  }

  // Convert to higher units
  const minutes = secondsToCrack / 60;
  if (minutes < 60) {
    return `${Math.ceil(secondsToCrack)} seconds`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.ceil(minutes)} minutes`;
  }

  const days = hours / 24;
  if (days < 365) {
    return `${Math.ceil(hours)} hours`;
  }

  const years = days / 365.25;
  if (years < 10) {
    return `${Math.ceil(days)} days`;
  }

  if (years < 1000) {
    return `${Math.ceil(years)} years`;
  }

  if (years < 1e6) {
    return `${(years / 1000).toFixed(1)} millennia (centuries)`;
  }

  if (years < 1e9) {
    return `${(years / 1e6).toFixed(1)} Million Years`;
  }

  return "Trillions of Years (virtually uncrackable)";
}

/**
 * Evaluates a password and returns a full diagnostic analysis object.
 */
export function analyzePassword(password: string): PasswordAnalysis {
  const L = password.length;
  const { entropy } = calculateEntropy(password);

  const checks: RequirementCheck[] = [
    { id: 'len', label: 'At least 12 characters (ideal)', met: L >= 12, type: 'length' },
    { id: 'upper', label: 'Uppercase letters (A-Z)', met: /[A-Z]/.test(password), type: 'uppercase' },
    { id: 'lower', label: 'Lowercase letters (a-z)', met: /[a-z]/.test(password), type: 'lowercase' },
    { id: 'num', label: 'Numbers (0-9)', met: /[0-9]/.test(password), type: 'number' },
    { id: 'special', label: 'Special characters (e.g. !@#$)', met: /[^a-zA-Z0-9]/.test(password), type: 'special' }
  ];

  // Also include custom length >= 8 check
  const lengthAtLeast8 = L >= 8;

  // Pattern checks
  const normalizedPassword = password.toLowerCase();
  const isExactCommon = COMMON_PASSWORDS.includes(normalizedPassword);
  
  // Custom checks for repeated characters (e.g. "aaaaa", "11111")
  const isRepeatedChar = L >= 4 && new Set(password.split("")).size === 1;

  // Check for common suffixes/prefixes on top of dictionary words (e.g. admin123, password!, welcome2026)
  let isSubCommon = false;
  if (!isExactCommon && L >= 4) {
    for (const common of COMMON_PASSWORDS) {
      if (common.length >= 4) {
        if (
          normalizedPassword === `${common}123` ||
          normalizedPassword === `${common}!` ||
          normalizedPassword === `${common}1` ||
          normalizedPassword === `123${common}` ||
          normalizedPassword === `1234${common}` ||
          normalizedPassword === `${common}1234` ||
          normalizedPassword === `${common}2026` ||
          normalizedPassword === `${common}2025` ||
          normalizedPassword === `${common}password` ||
          normalizedPassword === `password${common}`
        ) {
          isSubCommon = true;
          break;
        }
      }
    }
  }

  const isCommon = isExactCommon || isSubCommon || isRepeatedChar;

  const recommendations: string[] = [];

  // Determine Category & Score
  let score = 0;
  let category: StrengthCategory = 'Weak';

  if (L > 0) {
    // Length contribution (max 40)
    score += Math.min(L * 3, 40);

    // Variety contribution (max 40)
    let varieties = 0;
    if (/[a-z]/.test(password)) varieties++;
    if (/[A-Z]/.test(password)) varieties++;
    if (/[0-9]/.test(password)) varieties++;
    if (/[^a-zA-Z0-9]/.test(password)) varieties++;
    score += varieties * 10;

    // Deduct raw sequential chars repetition points
    // (e.g. repeating patterns, consecutive repetitions)
    let repeats = 0;
    for (let i = 0; i < L - 1; i++) {
      if (password[i] === password[i + 1]) repeats++;
    }
    score -= Math.min(repeats * 4, 15);

    // Cap score at 0-100
    score = Math.max(0, Math.min(score, 100));
  }

  // Override score/category if matching common dictionaries
  if (isCommon) {
    score = Math.min(score, 15);
    category = 'Weak';
  } else {
    // Categorize based on entropy & length score
    if (entropy < 30 || score < 35 || !lengthAtLeast8) {
      category = 'Weak';
    } else if (entropy < 55 || score < 60) {
      category = 'Medium';
    } else if (entropy < 80 || score < 85) {
      category = 'Strong';
    } else {
      category = 'Very Strong';
    }
  }

  // Recommendations compiling
  if (L === 0) {
    recommendations.push("Enter a password to initiate security analysis.");
  } else {
    if (isExactCommon) {
      recommendations.push("⚠️ DANGER: This matches an exact, world-famous common dictionary password. Never use this under any circumstances.");
    } else if (isSubCommon) {
      recommendations.push("⚠️ DANGER: This is a predictable pattern consisting of a common dictionary word paired with an obvious suffix/prefix (like '123' or '!'). Dictionary cracking tools will decode this pattern query in milliseconds.");
    } else if (isRepeatedChar) {
      recommendations.push("⚠️ DANGER: This password is composed entirely of a single repeated character. This is one of the easiest patterns for computer networks to brute-force.");
    }
    if (L < 8) {
      recommendations.push("Increase password length immediately. Under 8 characters is highly vulnerable to brute-force.");
    } else if (L < 12) {
      recommendations.push("Aim for 12 or more characters. Length is the single most important factor in entropy.");
    }

    if (!/[A-Z]/.test(password)) {
      recommendations.push("Insert at least one capital letter to expand the key variety.");
    }
    if (!/[a-z]/.test(password)) {
      recommendations.push("Insert at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      recommendations.push("Include a number (0-9) to raise search complexity.");
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      recommendations.push("Add a special character symbol (e.g., @, #, $, *, &) to disrupt dictionary heuristics.");
    }

    // Sequenced characters warnings
    if (/123|abc|qwerty|asd/i.test(password)) {
      recommendations.push("💡 Avoid common sequential runs (like '123', 'abc', or 'qwerty') which automated dictionary systems run first.");
    }

    if (category === 'Strong' && L >= 12) {
      recommendations.push("Excellent work. Add one more symbol or extend length to reach maximum 'Very Strong' security.");
    }
    if (category === 'Very Strong') {
      recommendations.push("🏆 Superb password! This represents maximum grade cryptographic resistance to passive or intensive audits.");
    }
  }

  return {
    password,
    score,
    entropy: Math.round(entropy * 10) / 10,
    category,
    checks,
    commonPasswordMatch: isCommon,
    recommendations,
    crackTimeEstimate: getCrackTimeEstimate(entropy)
  };
}

/**
 * High entropy password generator
 */
export function generatePassword(options: GeneratedPasswordOptions): string {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSpecial } = options;

  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let charPool = "";
  let mandatoryChars: string[] = [];

  if (includeUppercase) {
    charPool += uppercaseChars;
    mandatoryChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
  }
  if (includeLowercase) {
    charPool += lowercaseChars;
    mandatoryChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
  }
  if (includeNumbers) {
    charPool += numberChars;
    mandatoryChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  if (includeSpecial) {
    charPool += specialChars;
    mandatoryChars.push(specialChars[Math.floor(Math.random() * specialChars.length)]);
  }

  // Default fallback if nothing selected
  if (charPool === "") {
    charPool = lowercaseChars + numberChars;
    mandatoryChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    mandatoryChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }

  let generatedPassword = [...mandatoryChars];
  const remainingLength = Math.max(0, length - generatedPassword.length);

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    generatedPassword.push(charPool[randomIndex]);
  }

  // Shuffle the result to prevent static pattern bias
  for (let i = generatedPassword.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = generatedPassword[i];
    generatedPassword[i] = generatedPassword[j];
    generatedPassword[j] = temp;
  }

  return generatedPassword.join("");
}
