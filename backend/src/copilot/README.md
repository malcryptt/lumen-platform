# Lumen Copilot AI
#### AI-Powered Deployment Platform Module for Lumen

Lumen Copilot is an AI-powered assistant for the Lumen ecosystem. It automates repository scanning, detects technology stacks, generates native `.lumen` deployment configurations, and orchestrates cloud deployments to Render.

---

## 🚀 Features
- **AI Repo Scanner**: Detects runtimes, build steps, and start commands using Gemini 2.0 Flash.
- **Config Generator**: Automatically creates syntactically correct `.lumen` files.
- **Conversational Guide**: Groq-powered chat assistant for real-time deployment support.
- **Auto-Deployment**: Seamless integration with the Render API for one-click cloud launches.
- **Error Diagnosis**: AI reads deploy logs to identify and fix configuration issues.

## 🛠 Setup

### Environment Variables
Create a `.env` file in the `backend/` directory with the following keys:
```env
# AI API Keys
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Cloud Provider Keys
RENDER_API_KEY=your_render_api_key

# Optional
LUMEN_BACKEND_URL=http://localhost:3001
```

### Installation
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

## 📖 Usage

### CLI Walkthrough
Use the `lumen` CLI to manage your deployments:
- `lumen deploy scan <repo-url>`: Scan a repository and generate a config.
- `lumen deploy status <session-id>`: Check the scanning or deployment status.
- `lumen deploy push <session-id>`: Execute the deployment to the cloud.
- `lumen deploy chat`: Start a conversation with the Copilot guide.

### Web UI
The Copilot interface is available at the `/copilot` route on the Lumen dashboard (Vercel deployment).

## 🏗 Architecture
Lumen Copilot is designed with a modular multi-LLM strategy:
- **Repo Scanner & Config Generator**: Google Gemini 2.0 Flash (high reasoning, large context).
- **Copilot Chat Agent**: Groq (Llama 3.1 70B) for ultra-fast conversational responses.
- **Core Orchestration**: TypeScript + Fastify + Prisma.

## 💼 Freelance Pitch
**Lumen Copilot as a Service**
Agencies and independent developers can leverage Lumen Copilot to offer "Instant Deployment" services for their clients. Instead of manually configuring complex cloud infrastructure, use Lumen Copilot to automate the entire DevOps pipeline for any node, python, or go backend project in seconds.

---
*Built with ❤️ by mal4crypt for the Lumen Platform*
