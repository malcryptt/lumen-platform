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

# Real binary download from GitHub Releases
echo "── Downloading binary for $PLATFORM-$ARCH..."
curl -L "https://github.com/malcryptt/lumen-platform/releases/latest/download/lumen-$PLATFORM-$ARCH" -o "$INSTALL_DIR/bin/lumen"

if [ ! -f "$INSTALL_DIR/bin/lumen" ]; then
    echo "Error: Binary download failed. Please check your internet connection or GitHub status."
    exit 1
fi

chmod +x "$INSTALL_DIR/bin/lumen"

# Add to PATH if not present
if [[ ":$PATH:" != *":$INSTALL_DIR/bin:"* ]]; then
    echo "── Adding $INSTALL_DIR/bin to PATH in .bashrc"
    echo "export PATH=\"\$PATH:$INSTALL_DIR/bin\"" >> "$HOME/.bashrc"
    echo "── Please restart your terminal or run: source ~/.bashrc"
fi

echo "── Lumen successfully installed to $INSTALL_DIR/bin/lumen"
echo "── Run 'lumen version' to verify."
