# Lumen Platform

The fast, secure, multipurpose language for the modern era.

## Project Structure

- `lumen-cli/`: C++ source for the `lumen` compiler and shells.
- `common/`: Shared configuration and utility logic.
- `vscode-extension/`: VS Code support for Lumen development.
- `website/`: The Next.js frontend for `lumen-lang.org`.
- `web-ide-backend/`: Containerized execution environment for the Web IDE.
- `docs/`: Technical documentation and deployment guides.

## Quick Start

### Building the CLI
```bash
mkdir build && cd build
cmake ..
make
./lumen-cli/lumen shell
```

### Running the Web IDE Locally
1. **Backend**:
   ```bash
   cd web-ide-backend
   docker build -t lumen-sandbox .
   npm start
   ```
2. **Frontend**:
   ```bash
   cd website
   npm install
   npm run dev
   ```

## Deployment

Lumen is designed for hybrid deployment:
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway/VPS (Docker)

See [Deployment Guide](docs/deployment.md) for details.

## License
MIT
