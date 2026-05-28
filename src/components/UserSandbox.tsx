/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { UserCheck, RefreshCw, Key, ShieldAlert, History, KeyRound } from 'lucide-react';
import { analyzePassword } from '../lib/pwdEngine';
import { motion, AnimatePresence } from 'motion/react';

interface SandboxUserSummary {
  username: string;
  historyCount: number;
  createdAt: string;
}

interface UserSandboxProps {
  currentPasswordVal?: string;
  onSelectSavedPassword?: (pass: string) => void;
}

export default function UserSandbox({ currentPasswordVal = '', onSelectSavedPassword }: UserSandboxProps) {
  const [users, setUsers] = useState<SandboxUserSummary[]>([]);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedSuccess, setFeedSuccess] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        if (data.length > 0 && !selectedUser) {
          setSelectedUser(data[0].username);
        }
      }
    } catch (err) {
      console.error('Failed to load sandbox database users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Autofill current analyzer password into sandbox forms for seamless UX
  const handleAutofillReg = () => {
    setRegPassword(currentPasswordVal);
  };

  const handleAutofillChange = () => {
    setNewPassword(currentPasswordVal);
  };

  // Submit registration
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedError(null);
    setFeedSuccess(null);

    const userClean = regUsername.trim();
    if (!userClean || !regPassword) {
      setFeedError('Please provide both username and password.');
      return;
    }

    try {
      setRegistering(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userClean, password: regPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedError(data.error || 'Registration failed.');
        return;
      }

      setFeedSuccess(`Account matching '${userClean}' registered successfully! Standard Bcrypt salt stretching applied.`);
      setRegUsername('');
      setRegPassword('');
      fetchUsers();
    } catch (err: any) {
      setFeedError('Communications failed with server backend.');
    } finally {
      setRegistering(false);
    }
  };

  // Submit password rotation update
  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedError(null);
    setFeedSuccess(null);

    if (!selectedUser || !newPassword) {
      setFeedError('Please select a simulated user and provide a new password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUser, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        // This is a crucial demonstrative safety trigger warning
        setFeedError(data.error);
        return;
      }

      setFeedSuccess(`Rotation check completed. Unique password accepted! Account history has been updated.`);
      setNewPassword('');
      fetchUsers();
    } catch (err) {
      setFeedError('Communications failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic analysis for registrations
  const regAnalysis = regPassword ? analyzePassword(regPassword) : null;
  const changeAnalysis = newPassword ? analyzePassword(newPassword) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <UserCheck size={18} />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">Hashed History & Fraud Sandbox</h3>
        </div>
        <button
          onClick={fetchUsers}
          id="btn_sandbox_refresh_db"
          className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh Tables"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        This sandbox interfaces with our live Node.js Express service running secure <strong className="text-gray-700">Bcrypt password stretch hashing</strong>.
        Test creating secure profiles and upgrading passwords to experience full-circle rotation policies that strictly prevent historical password reuse.
      </p>

      {/* Global alert feedback console */}
      {(feedError || feedSuccess) && (
        <div className="mb-6">
          {feedError && (
            <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs flex items-start space-x-2.5">
              <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Database Security Triggered</strong>
                <p className="leading-relaxed font-mono">{feedError}</p>
              </div>
            </div>
          )}
          {feedSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex items-start space-x-2.5">
              <UserCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Operation Succeeded</strong>
                <p className="leading-relaxed font-mono">{feedSuccess}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form 1: Account Registration */}
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">1. Register Sandbox Profile</h4>
          
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 font-mono">USERNAME</label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. alice_dev"
                id="sandbox_reg_username"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-600 font-mono">PASSWORD</label>
                {currentPasswordVal && (
                  <button
                    type="button"
                    onClick={handleAutofillReg}
                    id="btn_sandbox_autofill_reg"
                    className="text-[10px] text-indigo-600 hover:underline font-medium"
                  >
                    Use typed password
                  </button>
                )}
              </div>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Must be 'Medium' or stronger"
                id="sandbox_reg_password"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              
              {/* Quality alert helper for registration */}
              {regAnalysis && (
                <div className="mt-1.5 flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">Rating:</span>
                  <span className={`font-semibold ${
                    regAnalysis.category === 'Weak' ? 'text-rose-500' : 'text-emerald-600'
                  }`}>
                    {regAnalysis.category} ({regAnalysis.score} pts)
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={registering}
              id="btn_sandbox_submit_reg"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Confirm Registration
            </button>
          </form>
        </div>

        {/* Form 2: Password Rotation simulation */}
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">2. Simulate Password Change</h4>
          
          <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 font-mono">TARGET ACCOUNT</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                id="sandbox_select_user"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none"
              >
                {users.length === 0 ? (
                  <option value="">-- No users registered yet --</option>
                ) : (
                  users.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.username} ({u.historyCount} historic hashes)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-gray-600 font-mono">NEW PASSWORD</label>
                {currentPasswordVal && (
                  <button
                    type="button"
                    onClick={handleAutofillChange}
                    id="btn_sandbox_autofill_change"
                    className="text-[10px] text-indigo-600 hover:underline font-medium"
                  >
                    Use typed password
                  </button>
                )}
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Simulate rotation/reuse test"
                id="sandbox_change_password"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              
              {/* Quality alert helper for change */}
              {changeAnalysis && (
                <div className="mt-1.5 flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">New Rating:</span>
                  <span className={`font-semibold ${
                    changeAnalysis.category === 'Weak' ? 'text-rose-500' : 'text-emerald-600'
                  }`}>
                    {changeAnalysis.category}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={users.length === 0 || isLoading}
              id="btn_sandbox_submit_change"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              Verify & Rotate Pass
            </button>
          </form>
        </div>

        {/* Column 3: Active table of histories */}
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Database Ledger</span>
              <span className="text-[10px] font-light bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full lowercase font-mono">
                {users.length} profiles
              </span>
            </h4>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <History size={24} className="mx-auto mb-2 opacity-40 text-gray-500" />
                No profiles loaded in database.
              </div>
            ) : (
              <div className="max-h-[160px] overflow-y-auto border border-gray-200/55 rounded-lg bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 uppercase font-mono tracking-wider text-[9px] border-b border-gray-200-dashed">
                      <th className="px-2.5 py-1.5 font-bold">User</th>
                      <th className="px-2.5 py-1.5 font-bold text-center">Hashes Pool</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.username} className="hover:bg-gray-50/50">
                        <td className="px-2.5 py-2 font-semibold text-gray-700 truncate max-w-[110px]">
                          {u.username}
                        </td>
                        <td className="px-2.5 py-2 text-center font-mono font-medium text-indigo-600">
                          {u.historyCount} hash{u.historyCount > 1 ? 'es' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-3 text-[10px] text-gray-500 bg-white/70 p-2.5 rounded-lg border border-gray-200/40">
            <p className="flex items-center text-gray-700 font-semibold mb-0.5">
              <KeyRound size={11} className="mr-1 text-emerald-500 shrink-0" />
              Hashing Implementation
            </p>
            Plaintext entries are safely converted using random salts to prevent rainbow-table mapping. 
            Older password attempts are preserved in user buckets to trigger unique comparisons.
          </div>
        </div>

      </div>
    </div>
  );
}
