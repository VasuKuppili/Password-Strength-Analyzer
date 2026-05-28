/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initDB, registerUser, updatePassword, listUsersSummary, findUser } from "./server-modules/database";
import { analyzePassword } from "./src/lib/pwdEngine";

// Initialize the database on application bootstrap
initDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser with safety limit size
  app.use(express.json({ limit: "1mb" }));

  // ==========================================
  // API Endpoints
  // ==========================================

  // 1. Password Strength Analyzer API
  app.post("/api/analyze", (req, res) => {
    try {
      const { password } = req.body;
      if (password === undefined) {
        res.status(400).json({ error: "Password field is required in the body." });
        return;
      }
      
      const analysisResult = analyzePassword(password);
      res.json(analysisResult);
    } catch (err: any) {
      res.status(500).json({ error: "Analysis failed", details: err.message });
    }
  });

  // 2. Fetch User Summary (for sandboxed visualization)
  app.get("/api/users", (req, res) => {
    try {
      const users = listUsersSummary();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to list users", details: err.message });
    }
  });

  // 3. Register user with secure hash & quality bar
  app.post("/api/register", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ error: "Both username and password are required." });
        return;
      }

      const trimmedUser = username.trim();
      if (trimmedUser.length < 3) {
        res.status(400).json({ error: "Username must be at least 3 characters." });
        return;
      }

      // Check strength quality bar before creating user!
      const analysis = analyzePassword(password);
      if (analysis.category === "Weak") {
        res.status(400).json({ 
          error: "Registration Rejected: Password is too weak.",
          details: "You cannot create accounts with passwords rated as 'Weak'. Please add more variety or length, and make sure it is not in the dictionary."
        });
        return;
      }

      const result = registerUser(trimmedUser, password);
      if (!result.success) {
        res.status(400).json({ error: result.error || "Registration failed." });
        return;
      }

      res.status(201).json({ message: "Registration successful!", username: trimmedUser });
    } catch (err: any) {
      res.status(500).json({ error: "Registration error", details: err.message });
    }
  });

  // 4. Change Password with reuse limit
  app.post("/api/change-password", (req, res) => {
    try {
      const { username, newPassword } = req.body;
      if (!username || !newPassword) {
        res.status(400).json({ error: "Username and new password are required." });
        return;
      }

      const user = findUser(username);
      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      // Pre-evaluate strength on update too
      const analysis = analyzePassword(newPassword);
      if (analysis.category === "Weak") {
        res.status(400).json({ 
          error: "Update Rejected: Password is too weak.",
          details: "The new password must be at least 'Medium' strength."
        });
        return;
      }

      // Update password (performs checks on old hashes and currently configured passwords)
      const result = updatePassword(username, newPassword);
      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: "Password updated successfully!", historyCount: user.history.length });
    } catch (err: any) {
      res.status(500).json({ error: "Password update failed", details: err.message });
    }
  });

  // ==========================================
  // Vite Middleware Handling For Assets
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Server] Loaded Vite middleware in Development mode.");
  } else {
    // Production Mode: Static compiled delivery
    const distPath = path.join(process.cwd(), "dist");
    
    // First serve explicit static artifacts
    app.use(express.static(distPath));
    
    // Fallback all routes directly to SPA client index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`[Server] Mounting static server inside production folder '${distPath}'`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Password Strength Analyzer running on http://localhost:${PORT}`);
  });
}

startServer();
