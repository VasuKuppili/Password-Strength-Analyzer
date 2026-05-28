/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Lock, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white shadow-md shadow-teal-100">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 tracking-tight text-lg">
              SentinelPass
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
              Password Strength & Entropy Analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
            <Activity size={12} className="text-emerald-500 animate-pulse mr-1" />
            <span>Secure Backend Active</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">
            <Lock size={12} />
            <span>Local & Sandbox Restrictive</span>
          </div>
        </div>
      </div>
    </header>
  );
}
