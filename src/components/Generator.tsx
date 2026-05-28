/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ArrowRightLeft, Sparkles } from 'lucide-react';
import { generatePassword, analyzePassword } from '../lib/pwdEngine';
import { GeneratedPasswordOptions } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GeneratorProps {
  onUsePassword: (password: string) => void;
}

export default function Generator({ onUsePassword }: GeneratorProps) {
  const [options, setOptions] = useState<GeneratedPasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: true,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate on mount or options change for immediate visual feedback
  const triggerGeneration = () => {
    const fresh = generatePassword(options);
    setPassword(fresh);
    setCopied(false);
  };

  useEffect(() => {
    triggerGeneration();
  }, [
    options.length,
    options.includeUppercase,
    options.includeLowercase,
    options.includeNumbers,
    options.includeSpecial,
  ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Evaluate the strength of generated password for live indicators
  const analysis = analyzePassword(password);

  // Helper to color strength labels
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Very Strong': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Strong': return 'text-teal-600 bg-teal-50 border-teal-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-rose-600 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Sparkles size={18} />
            </div>
            <h3 className="font-semibold text-gray-900 text-base">Secure Password Generator</h3>
          </div>
          <button
            onClick={triggerGeneration}
            id="btn_generator_refresh"
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-95"
            title="Generate New Password"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Generated output row */}
        <div className="mb-6">
          <div className="relative group">
            <input
              type="text"
              readOnly
              value={password}
              id="generated_password_input"
              className="w-full pr-24 pl-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl font-mono text-sm tracking-wide text-center focus:outline-none"
            />
            <div className="absolute right-2 top-1.5 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleCopy}
                id="btn_generator_copy"
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all active:scale-95 duration-150"
                title="Copy Password"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2.5 px-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-gray-400 font-mono">Entropy: {analysis.entropy} bits</span>
            </div>
            <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full transition-all duration-200 ${getCategoryColor(analysis.category)}`}>
              {analysis.category}
            </span>
          </div>
        </div>

        {/* Length setting */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
              <span>Password Length</span>
              <span className="font-mono text-indigo-600 text-sm">{options.length} chars</span>
            </div>
            <input
              type="range"
              min="8"
              max="48"
              value={options.length}
              id="slider_password_length"
              onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>

          {/* Character sets toggles */}
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex items-center space-x-2.5 p-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer select-none transition-all">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                id="chk_uppercase"
                onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-gray-700 font-medium">A-Z (Upper)</span>
            </label>

            <label className="flex items-center space-x-2.5 p-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer select-none transition-all">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                id="chk_lowercase"
                onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-gray-700 font-medium">a-z (Lower)</span>
            </label>

            <label className="flex items-center space-x-2.5 p-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer select-none transition-all">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                id="chk_numbers"
                onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-gray-700 font-medium">0-9 (Digits)</span>
            </label>

            <label className="flex items-center space-x-2.5 p-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer select-none transition-all">
              <input
                type="checkbox"
                checked={options.includeSpecial}
                id="chk_special"
                onChange={(e) => setOptions(prev => ({ ...prev, includeSpecial: e.target.checked }))}
                className="w-4.5 h-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-gray-700 font-medium">!@#$ (Special)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Button to feed password back to the analyzer */}
      <button
        type="button"
        onClick={() => onUsePassword(password)}
        id="btn_use_generated_password"
        className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-98"
      >
        <ArrowRightLeft size={14} />
        <span>Load into Analyzer</span>
      </button>
    </div>
  );
}
