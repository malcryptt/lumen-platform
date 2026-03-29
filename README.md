# Lumen Platform v2 (Beta)

Lumen is an AI-powered developer ecosystem designed for hyper-fast deployment, secure secret management, and automated infrastructure diagnosis. 

## 1. Project Overview
Lumen transitions traditional cloud workflows into "AI-native" cycles. Using Gemini 2.0 Flash, it scans project repos, generates deterministic `.lumen` configurations, and orchestrates multi-service deployments on Render.

## 2. Quick Start (Standard Setup)
```bash
# Install the CLI
curl -sSf https://lumen-platform-beta.vercel.app/install.sh | sh

# Login (Hardware-bound encryption)
lumen login

# Scan and Deploy
lumen deploy scan https://github.com/user/my-app
lumen deploy push
```

## 3. Technology Stack
- **Backend:** Node.js, Fastify, Prisma (PostgreSQL), Gemini 2.0 Flash (Diagnosis), Groq (Copilot Chat).
- **Frontend:** Next.js 15, TailwindCSS, Lucide Icons.
- **CLI:** C++20 (LSP/DAP support), CMake, Python3 hooks.
- **Extensions:** VS Code (Typescript).

## 4. Operational Bible (Ground Truth)
The architectural integrity of the platform is governed by the `COPILOT_BIBLE.md`. All developers must adhere to its specifications for:
- State machine transitions (`idle` -> `live`).
- AES-256-GCM secret encryption at rest.
- Sequential monorepo rollouts.

## 5. Security & Redaction Rules
Lumen maintains a strict zero-trust posture toward credentials:
- **Redaction:** Logs stored in the database are automatically stripped of API keys and bearer tokens.
- **SSRF protection:** Scanners are restricted to GitHub/GitLab domains only.
- **Hardware-bound keys:** CLI tokens are encrypted using a hash of the local machine's unique hardware ID.

## 6. Monorepo Orchestration
Lumen natively supports multi-directory projects. Define multiple `deploy` blocks in your `.lumen` config. The runner executes them sequentially, ensuring dependencies (like a database or backend) are healthy before launching dependents.

## 7. AI Copilot Chat & Memory
The Copilot sidebar uses a sliding context window (Section 11.2 of the Bible):
- Retains 10-message short-term memory.
- Auto-truncates based on token limits.
- Context-aware regarding your current deployment status and build errors.

## 8. Development & Contribution
```bash
# Backend
cd backend && npm run dev

# Website
cd website && npm run dev

# Testing
cd backend && npm test
```

## 9. Troubleshooting & Recovery
If a deployment fails:
1. Run `lumen deploy diagnose` to trigger a Gemini-powered log audit.
2. Review the `ROOT CAUSE` suggested by the AI.
3. Use `lumen deploy config --edit` to apply the fix and re-push.

## 10. API Specification
- **`POST /copilot/scan`**: Trigger AI repo analysis.
- **`POST /copilot/deploy/:id`**: Start cloud build.
- **`GET /copilot/session/:id`**: Fetch real-time status and logs.
- **`PUT /copilot/integrations`**: Manage encrypted cloud credentials.

## 11. Deployment Strategy
Lumen is deployed via PM2 and Turbopack. Production migrations are handled via `npx prisma db push` to ensure the Registry-v2 schema remains synchronized with the Operational Bible.

---
*Built for the next generation of cloud developers.*
