/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, HelpCircle, Server, KeyRound, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Education() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center space-x-2.5 mb-5">
        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
          <BookOpen size={18} />
        </div>
        <h3 className="font-semibold text-gray-900 text-base">Password Security Core Concepts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Entropy & Formula */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="flex items-center text-sm font-semibold text-gray-800 mb-2">
              <KeyRound size={15} className="mr-1.5 text-indigo-500" />
              What is Shannon Entropy?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              In security science, <strong>entropy</strong> measures the random unpredictability of a password. 
              Higher entropy represents greater resistance to brute-force algorithms guessing the combination.
            </p>
            
            <div className="my-3 p-3 bg-indigo-50/60 rounded-lg text-center font-mono text-xs border border-indigo-100 text-indigo-900">
              <span className="font-bold">E = L × log₂ ( R )</span>
            </div>

            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>• <span className="font-medium text-gray-800">L (Length):</span> Number of character slots in the entry.</li>
              <li>• <span className="font-medium text-gray-800">R (Pool Size):</span> The quantity of distinct characters selectable.</li>
              <li>• <span className="font-medium text-gray-800">log₂(R) (Pool Bits):</span> Base-2 bits per character slot.</li>
            </ul>
          </div>

          <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/40">
            <h4 className="flex items-center text-sm font-semibold text-gray-800 mb-1.5">
              <span className="text-lg mr-1.5">💡</span>
              The Power of Word Passphrases
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Adding single symbols to short passwords is less effective than simply expanding the length! 
              A 15-character phrase made of four common dictionary words (e.g., <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200">forest-chair-blue-run</code>) 
              is incredibly easy for humans to remember but requires millennia to crack because of its vast spacing depth.
            </p>
          </div>
        </div>

        {/* Right Column: Key Stretching & Best Practices */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="flex items-center text-sm font-semibold text-gray-800 mb-2">
              <Cpu size={15} className="mr-1.5 text-emerald-500" />
              Key Stretching & Bcrypt
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Fast hash algorithms (like MD5 or SHA-256) are poor choices for database password storage because they prioritize throughput. 
              Attackers can run billions of combinations per second of stolen databases.
            </p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              <strong>Bcrypt</strong> is an adaptive, slow hashing algorithm. It implements a adjustable work coefficient 
              to extend calculation time on inputs (Key Stretching). This makes brute-force search operations too computationally 
              expensive to execute on modern hardware arrays.
            </p>
          </div>

          <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100">
            <h4 className="flex items-center text-sm font-semibold text-amber-800 mb-1.5">
              ⚡ Crucial Password Safeguards
            </h4>
            <ul className="space-y-1.5 text-xs text-amber-900/80">
              <li>• <strong>Zero Cross-Reuse:</strong> Never utilize identical passwords across financial and casual social media services.</li>
              <li>• <strong>Use Password Managers:</strong> Automate creation of strong, randomized, distinct passcodes.</li>
              <li>• <strong>Configure Multi-Factor Force:</strong> Combine passwords with Authenticator key codes or physical tokens.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
