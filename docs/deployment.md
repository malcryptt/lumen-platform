# Deployment Guide: Lumen Platform

The Lumen Platform can be deployed to Vercel (Frontend), Render (Full Stack), or any VPS (Docker).

## 1. Cloud Platforms

### Render (Recommended for Full Stack)
Lumen includes a `render.yaml` blueprint. To deploy everything (Website, IDE Backend, Registry, and DB) at once:
1. Create a new **Blueprint** on your Render dashboard.
2. Connect your GitHub repository.
3. Render will automatically detect `render.yaml` and provision all services.

### Render (Recommended for Backend)
Lumen's execution engines require container support.
1. Run `./deploy-render.sh` locally to push the **IDE Backend** and **Registry** images to Docker Hub.
2. On Render, click **New +** -> **Web Service** -> **Deploy an existing image**.
3. Use `user/lumen-ide-backend:latest` (Port 3001) and `user/lumen-registry:latest` (set `DATABASE_URL`).

### Vercel (Recommended for Frontend)
Since Vercel has a superior build pipeline, we recommend deploying the `website/` folder there:
1. Push your code to GitHub or use the Vercel CLI.
2. Link the `website/` directory.
3. Set the environment variable `NEXT_PUBLIC_BACKEND_URL` to your Render IDE Backend URL (e.g., `wss://lumen-ide-backend.onrender.com`).
The `website/` directory is a standard Next.js application.

### Automatic Deployment (Recommended)
1. Push your code to a GitHub repository.
2. Import the repository into the **Vercel Dashboard**.
3. Set the **Root Directory** to `website`.
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_BACKEND_URL`: The URL of your deployed execution backend (see below).

### Deployment via Docker Compose (Simplest for VPS)
If you are deploying to a VPS (DigitalOcean, AWS, etc.), use the provided `docker-compose.yml` to bring up all backend services (IDE, Registry, and Database) at once:

```bash
docker-compose up -d
```

---

## 2. Backend: Service Details

The `web-ide-backend` requires Docker to manage sandboxed execution. **Vercel does not support this natively.**

### Deployment on Railway (Recommended for simplicity)
1. Create a new project on [Railway](https://railway.app/).
2. Connect your GitHub repository.
3. Railway will automatically detect the `Dockerfile` in `web-ide-backend`.
4. Ensure the port is mapped to `3001`.

### Manual Deployment (Docker)
```bash
cd web-ide-backend
docker build -t lumen-sandbox .
docker run -p 3001:3001 lumen-sandbox
```

---

## 3. "Vercel Only" Strategy (Strategic Recommendation)

To achieve a 100% "Vercel Only" deployment without a containerized backend, the Lumen Platform should be compiled to **WebAssembly (WASM)**.

### Benefits
- **Zero Backend Cost**: Execution happens in the user's browser.
- **Infinite Scalability**: No server-side container orchestration needed.
- **Privacy**: Code never leaves the user's machine.

### Roadmap
1. Port the Lumen VM (C++) to WASM using **Emscripten**.
2. Update the `website/` to load the WASM module and run code locally.
3. Eliminate the `web-ide-backend` service entirely.
