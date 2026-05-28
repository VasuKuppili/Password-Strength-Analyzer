/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, ShieldCheck, ShieldAlert, BadgeCheck, Loader2, 
  HelpCircle, Sparkles, Check, X, ShieldAlert as AlertIcon, Lock, Key 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Generator from './components/Generator';
import UserSandbox from './components/UserSandbox';
import Education from './components/Education';
import { analyzePassword } from './lib/pwdEngine';
import { PasswordAnalysis } from './types';

export default function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis>(analyzePassword(''));

  // Calculate analysis instantaneously on client typing
  useEffect(() => {
    setAnalysis(analyzePassword(password));
  }, [password]);

  const handleUseAlternativePassword = (alternative: string) => {
    setPassword(alternative);
    // Auto show it so they can see the generated characters
    setShowPassword(true);
  };

  // Helper styles for strength category
  const getStrengthMeta = (category: string) => {
    switch (category) {
      case 'Very Strong':
        return {
          color: 'text-emerald-600',
          bg: 'bg-emerald-500',
          border: 'border-emerald-200',
          bgLight: 'bg-emerald-50/70',
          textBg: 'text-emerald-800 bg-emerald-50',
          desc: 'High standard cryptographic protection. Impervious to off-the-shelf and hyper-threaded offline cracking rigs.'
        };
      case 'Strong':
        return {
          color: 'text-teal-600',
          bg: 'bg-teal-500',
          border: 'border-teal-200',
          bgLight: 'bg-teal-50/70',
          textBg: 'text-teal-800 bg-teal-50',
          desc: 'Excellent core structure. Adequate for primary finance and data security shields.'
        };
      case 'Medium':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-400',
          border: 'border-amber-200',
          bgLight: 'bg-amber-50/60',
          textBg: 'text-amber-800 bg-amber-50',
          desc: 'Moderate resistance. Vulnerable to tailored high-performance target dictionaries and customized parallel searches.'
        };
      default:
        return {
          color: 'text-rose-600',
          bg: 'bg-rose-500',
          border: 'border-rose-200',
          bgLight: 'bg-rose-50/70',
          textBg: 'text-rose-800 bg-rose-50',
          desc: 'Critically high vulnerability. Can expand to instant breaches under minimal computing sweeps or simple dictionary runs.'
        };
    }
  };

  const meta = getStrengthMeta(analysis.category);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          
          {/* Main Workspace Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Workspace: Live Analysis Dashboard (7/12 layout) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Dynamic Analysis Input Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-100">
                  <motion.div 
                    className={`h-full transition-all duration-300 ${meta.bg}`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base">Strength Testing Console</h2>
                    <p className="text-xs text-gray-400">Values are checked in-memory automatically on key presses</p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${meta.textBg} ${meta.border}`}>
                    {analysis.category}
                  </span>
                </div>

                {/* Input box */}
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password to evaluate security strength..."
                    id="analyzer_password_input"
                    className="w-full pr-12 pl-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-indigo-500 rounded-xl font-mono text-sm tracking-wide transition-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    id="btn_toggle_password_view"
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Meter indicators segments */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((segmentIndex) => {
                    let active = false;
                    let segmentBg = 'bg-gray-100';
                    
                    if (analysis.category === 'Weak' && segmentIndex === 1) {
                      active = true;
                      segmentBg = 'bg-rose-500';
                    } else if (analysis.category === 'Medium' && segmentIndex <= 2) {
                      active = true;
                      segmentBg = 'bg-amber-400';
                    } else if (analysis.category === 'Strong' && segmentIndex <= 3) {
                      active = true;
                      segmentBg = 'bg-teal-500';
                    } else if (analysis.category === 'Very Strong' && segmentIndex <= 4) {
                      active = true;
                      segmentBg = 'bg-emerald-500';
                    }

                    return (
                      <div key={segmentIndex} className="h-2 rounded-full relative overflow-hidden bg-gray-100">
                        <div className={`h-full w-full transition-all duration-300 ${active ? segmentBg : 'bg-transparent'}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Live rating details */}
                <div className="mt-4 flex items-center justify-between px-1">
                  <span className="text-[11px] text-gray-400 font-medium">Complexity Factor: {analysis.score} / 100</span>
                  {password && (
                    <span className="text-[11px] text-gray-400 font-semibold font-mono">
                      {password.length} symbols
                    </span>
                  )}
                </div>
              </div>

              {/* Grid 2: Mathematical Diagnostics: Entropy, Brute-Force Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Gauge A: Entropy gauge */}
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Shannon Entropy</h3>
                    <p className="text-[10px] text-gray-400 font-medium mb-3">Reflects theoretical unpredictable combinations depth</p>
                  </div>
                  
                  <div className="my-1">
                    <span className="text-3xl font-extrabold text-gray-800 tracking-tight font-mono">
                      {analysis.entropy}
                    </span>
                    <span className="text-xs font-medium text-gray-400 ml-1">bits</span>
                  </div>

                  <div className="mt-2 text-[11px] leading-relaxed text-gray-500 px-2">
                    {analysis.entropy < 30 ? (
                      <span className="text-rose-600 font-semibold">⚠️ Critically low randomization</span>
                    ) : analysis.entropy < 55 ? (
                      <span className="text-amber-600 font-medium">⚠️ Low search domain bounds</span>
                    ) : analysis.entropy < 80 ? (
                      <span className="text-teal-600 font-semibold">✓ Healthy security randomized bits</span>
                    ) : (
                      <span className="text-emerald-600 font-extrabold">🏆 Elite standard security depth</span>
                    )}
                  </div>
                </div>

                {/* Gauge B: Brute Force Cracking Speed Estimations */}
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm text-center flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Estimated Crack Time</h3>
                    <p className="text-[10px] text-gray-400 font-medium mb-3">Assuming standard GPU botnet cluster search rate</p>
                  </div>

                  <div className="my-1">
                    <span className={`text-sm md:text-base font-extrabold font-mono tracking-tight leading-7 block px-1 truncate ${
                      analysis.entropy < 55 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {analysis.crackTimeEstimate}
                    </span>
                  </div>

                  <div className="mt-2 text-[10px] bg-gray-50 text-gray-500 py-1 px-2.5 rounded-lg border border-gray-100/60 inline-flex items-center justify-center">
                    <span className="mr-1 animate-pulse text-emerald-500">●</span> Check rate: 100 Billion attempts/sec
                  </div>
                </div>

              </div>

              {/* Requirement Checklist Panel */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-sm mb-4">Structural Audit Checklist</h3>
                <div className="space-y-3">
                  {analysis.checks.map(chk => (
                    <div key={chk.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                      <div className="flex items-center space-x-2.5">
                        <span className={`p-1 rounded-full shrink-0 ${
                          chk.met ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'
                        }`}>
                          {chk.met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                        </span>
                        <span className={`font-medium ${chk.met ? 'text-gray-800' : 'text-gray-400'}`}>
                          {chk.label}
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        chk.met ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {chk.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Workspace: Suggestions & Alternative Generator (5/12 layout) */}
            <div className="lg:col-span-5 space-y-6 lg:h-full">
              
              {/* Generator Widget */}
              <Generator onUsePassword={handleUseAlternativePassword} />

              {/* Live Advisor Logic & Recommendations */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Security Advisor Logs</h3>
                
                {password.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center">
                    No active characters detected. Type in the Testing Console to load live audits.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed ${meta.bgLight} ${meta.border} text-gray-700`}>
                      <span className="font-semibold block mb-1">Pattern Analysis Summary:</span>
                      {meta.desc}
                    </div>

                    <div className="space-y-2 mt-2">
                      {analysis.recommendations.map((rec, index) => (
                        <div 
                          key={index} 
                          className="flex items-start space-x-2 text-[11px] text-gray-600 p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all duration-150"
                        >
                          <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* User Registration Sandbox Pane (Full Width) */}
          <UserSandbox currentPasswordVal={password} onSelectSavedPassword={handleUseAlternativePassword} />

          {/* Explanatory Cybersecurity Education Block */}
          <Education />

        </main>
      </div>

      {/* Aesthetic human-friendly Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <div>
            <p className="font-medium text-gray-600">SentinelPass Analyzer Engine</p>
            <p className="mt-0.5 font-mono text-[10px]">Version 1.2.0 • Secure Hashing Standards Sandbox</p>
          </div>
          <div className="mt-3 sm:mt-0 font-medium text-gray-500 text-right">
            <span>Powered by Bcryptjs & Shannon Entropy Formulas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
