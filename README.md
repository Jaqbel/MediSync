MediSync Local Development Setup
===============================

Follow these steps to run the MediSync application locally.

1. Prerequisites
   - **Node.js & npm:**  
     Install the latest LTS version from https://nodejs.org/.  
     Verify installation:
       ```
       node -v
       npm -v
       ```
   - **Git:**  
     Ensure Git is installed to clone the repository.

2. Clone the Repository
   ```bash
   git clone <YOUR_REPO_URL>
   cd medisync
   ```

3. Install Dependencies
   ```bash
   npm install
   ```
   *Note:* You must have added `cross-env` as a dev dependency and updated your `package.json` dev script:
   ```jsonc
   "scripts": {
     "dev": "cross-env NODE_ENV=development tsx server/index.ts",
     "dev:client": "vite --config vite.config.ts",
     "dev:server": "cross-env NODE_ENV=development tsx server/index.ts",
     // ...
   }
   ```

4. Environment Variables
   Create a `.env` file in the project root (same level as `package.json`) with the following:
   ```
   # Frontend (Vite)
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Backend & ORM
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host:port/medisync_db
   ```
   - Prefix all client‑side env variables with `VITE_`.
   - Do not commit `.env` to version control.

5. Database Setup (Drizzle)
   If you are using Drizzle ORM migrations:
   ```bash
   npx drizzle-kit generate   # (creates a migration snapshot)
   npx drizzle-kit push       # (applies migrations to your DATABASE_URL)
   ```

6. Start the Application
   - **All-in-One**  
     ```bash
     npm run dev
     ```
     This runs both the server and the client in parallel.
   - **Separate Terminals**  
     ```bash
     npm run dev:server   # starts the backend on http://localhost:3000
     npm run dev:client   # starts the frontend on http://localhost:5173
     ```

7. Access the App
   - Frontend PWA: http://localhost:5173  
   - API Backend:    http://localhost:3000  

8. Hot-Reload & Debugging
   - Frontend changes reload automatically via Vite.  
   - Backend changes reload via `tsx` (powered by `ts-node-dev`).

9. Troubleshooting
   - **'cross-env' not found:**  
     Ensure you ran `npm install --save-dev cross-env`.  
   - **Environment variables not loaded:**  
     Restart your terminal session or ensure `.env` is in the correct location.
   - **Port conflicts:**  
     Adjust ports in `server/index.ts` or `vite.config.ts` if 3000 or 5173 are in use.

Enjoy developing MediSync locally!
