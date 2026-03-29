# Lumen Platform v2

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Website](https://img.shields.io/badge/website-lumen--platform--v2-blue)](https://lumen-platform.vercel.app)
[![Beta](https://img.shields.io/badge/version-2.0.0--beta-orange)](https://v2.lumen-platform.vercel.app)

Lumen is more than just a language -- it's a professional-grade developer ecosystem. From source code to production, Lumen combines top-tier performance with state-of-the-art AI assistance.

---

## v2 Features

### AI-Powered Copilot (VS Code)
Integration with **Groq Llama 4 Scout** for context-aware code generation and debugging.
- **Deep Context**: Automatically uses your selected code as context for precise answers.
- **Instant Injection**: Generating high-performance Lumen code? Insert it into your file with one click.
- **Grammar v2**: Advanced syntax highlighting and LSP support for classes, imports, and reactive patterns.

### Zero-Friction AI Deploy
Move from local code to a live Render service in minutes with the Lumen v2 Deployment Engine.
- AI Scanning: Automatic runtime detection and .lumen config generation.
- Encrypted Secrets: Industry-standard AES-256-GCM encryption for all your cloud credentials and API keys.
- Live State Machine: Track your push from scanning to live with real-time log streaming.
- AI Diagnostics: Did the build fail? Our integrated Gemini 2.0 specialized models diagnose logs and fix your config automatically.

### Comparative Benchmarking
Verify performance directly in the Lumen Playground. Benchmark your Lumen scripts against Python 3.11/Node.js baselines in a secure sandbox.

---

## Integrated CLI

```bash
lumen run main.lm          # Execution
lumen deploy scan          # AI-Powered repo analysis
lumen deploy push          # Production deployment
lumen deploy status        # Tracking state
lumen deploy diagnose      # AI Troubleshooting 
lumen secrets add          # Secure key management
lumen login                # Secure token-based auth
```

---

## 🛠️ Quick Install

**Automatic One-Liner (Native Binary + VS Code Extension)**
```bash
curl -fsSL https://lumen-platform.vercel.app/install.sh | sh
```

**Clone from Source**
```bash
git clone https://github.com/mal4crypt/lumen-platform.git
cd lumen-platform && ./install.sh --build-all
```

---

## 💼 The Portfolio Pitch (Freelance)

*Lumen represents the next generation of developer tooling. Built for speed and security, it solves the most common bottleneck in software engineering: the gap between "it works on my machine" and "it's live in the cloud". By integrating AI into the heart of the deployment lifecycle, Lumen enables teams to deploy production-ready services with 70% less manual configuration.*

**Interested in building with Lumen? Join our Discord or check out the [Lumen Documentation](https://lumen-platform.vercel.app/docs).**

---

MIT © 2026 [mal4crypt](https://github.com/mal4crypt)
