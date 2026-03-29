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
    echo "── Adding $INSTALL_DIR/bin to PATH"
    
    # Common shell configuration files
    SHELL_FILES=("$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile" "$HOME/.bash_profile")
    
    for FILE in "${SHELL_FILES[@]}"; do
        if [ -f "$FILE" ]; then
            if ! grep -q "$INSTALL_DIR/bin" "$FILE"; then
                echo "export PATH=\"\$PATH:$INSTALL_DIR/bin\"" >> "$FILE"
            fi
        fi
    done

    # Support for Fish shell
    FISH_CONFIG="$HOME/.config/fish/config.fish"
    if [ -f "$FISH_CONFIG" ]; then
        if ! grep -q "$INSTALL_DIR/bin" "$FISH_CONFIG"; then
            echo "set -U fish_user_paths $INSTALL_DIR/bin \$fish_user_paths" >> "$FISH_CONFIG"
        fi
    fi

    echo "── Please restart your terminal or run: exec \$SHELL"
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
