> [!CAUTION]
> Don't use this application! It was entirely vibe coded with Claude Code 4. Security is likely lacking! For example, you need to set an env variable "JWT_SECRET" to something secure. The AI did seem to write code that reads it for JWT signing, but never mentioned it anywhere, and it doesn't validate that it's set. I have not audited this code at all, so relying on it for anything would be very risky. - Human

# AI-Generated Todo App

This complete todo application was written entirely by Claude 4 Sonnet with zero human coding. The app features user authentication, persistent SQLite storage, responsive design, and smart task prioritization - all generated through natural language conversation.

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```

3. **Start the frontend (in a new terminal):**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000` with the backend running on `http://localhost:5001`. The SQLite database is automatically created and managed in the server directory.

---
*This README was also written by AI.*

Human written: Here is a screenshot:
<img width="1163" alt="Screenshot 2025-05-22 at 7 39 17 PM" src="https://github.com/user-attachments/assets/346b0855-97ee-4381-b9a3-8e89f994395c" />
