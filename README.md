# Lumen Platform

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Website](https://img.shields.io/badge/website-lumen--lang.vercel.app-blue)](https://lumen-lang.vercel.app)

The complete platform around the Lumen programming language — shell, web IDE, website, installers, and editor extensions.

---

## Shell

```
 _     _   _ __  __ ___ _  _
| |   | | | |  \/  | __| \| |
| |__ | |_| | |\/| | _|| .` |
|____|_\___/|_|  |_|___|_|\_|

v2.0.0  |  lumen-lang.vercel.app  |  :help for commands

lumen> let name = "Mayor"
lumen> print("Hello, {name}!")
Hello, Mayor!
```

---

## Install

**Clone and build from source**
```bash
git clone https://github.com/mal4crypt/lumen.git
cd lumen
./install.sh
```

**One-line install**
```bash
curl -fsSL https://lumen-lang.org/install.sh | sh
```

**VS Code Extension**

Search **Lumen PL** in the VS Code extensions panel or run:
```bash
code --install-extension mal4crypt.lumen-lang
```

---

## Quick Commands

```bash
lumen run script.lm       # run a script
lumen shell               # open REPL
lumen new my-project      # create new project
lumen install pixel-web   # install a package
lumen fmt                 # format code
lumen test                # run tests
lumen build --release     # compile release build
lumen bundle              # package into single executable
```

---

## License

MIT © 2026 [mal4crypt](https://github.com/mal4crypt)

---

*Written by mal4crypt*
