#!/bin/bash
set -e

# Lumen Platform Universal Installer
# Usage: curl -fsSL https://lumen-lang.org/install.sh | sh

echo -e "\033[35m"
echo "   _                     "
echo "  | | _  _ _ __  ___ _ _ "
echo "  | || || | '  \\/ -_) ' \\"
echo "  |_|\\_,_|_|_|_|\\___|_||_|"
echo -e "\033[0m"
echo "Installing Lumen Platform..."

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux)  PLATFORM="linux" ;;
    Darwin) PLATFORM="macos" ;;
    *)      echo "Unsupported OS: $OS"; exit 1 ;;
esac

# Create directory
INSTALL_DIR="$HOME/.lumen"
mkdir -p "$INSTALL_DIR/bin"

# Mock binary download (In real world: fetch from GitHub Releases)
echo "── Downloading binary for $PLATFORM-$ARCH..."
# curl -L "https://github.com/lumen-lang/lumen/releases/latest/download/lumen-$PLATFORM-$ARCH" -o "$INSTALL_DIR/bin/lumen"

# For this demo, we assume the user has built it locally or we copy the current one
if [ -f "./build/lumen-cli/lumen" ]; then
    cp "./build/lumen-cli/lumen" "$INSTALL_DIR/bin/lumen"
else
    echo "Warning: Local build not found. Please build the project first."
fi

chmod +x "$INSTALL_DIR/bin/lumen"

# Add to PATH if not present
if [[ ":$PATH:" != *":$INSTALL_DIR/bin:"* ]]; then
    echo "── Adding $INSTALL_DIR/bin to PATH in .bashrc"
    echo "export PATH=\"\$PATH:$INSTALL_DIR/bin\"" >> "$HOME/.bashrc"
    echo "── Please restart your terminal or run: source ~/.bashrc"
fi

echo "── Lumen successfully installed to $INSTALL_DIR/bin/lumen"

# VS Code Extension installation
if command -v code &> /dev/null; then
    echo "── VS Code detected. Installing Lumen AI Editor Extension..."
    VSIX_URL="https://raw.githubusercontent.com/malcryptt/lumen-platform/main/vscode-extension/lumen-lang-0.1.0.vsix"
    curl -fsSL "$VSIX_URL" -o "$INSTALL_DIR/lumen-lang.vsix"
    code --install-extension "$INSTALL_DIR/lumen-lang.vsix" --force || true
    rm -f "$INSTALL_DIR/lumen-lang.vsix"
    echo "── IDE Extension & AI Copilot installed!"
else
    echo "── 'code' command not found, skipping VS Code Extension."
fi

echo "── Run 'lumen version' to verify."
