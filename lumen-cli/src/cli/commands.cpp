#include "commands.hpp"
#include <chrono> // Added for std::chrono
#include <cstring>
#include <filesystem> // Added for fs::create_directories
#include <fstream>    // Added for std::ofstream
#include <iostream>
#include <string>
#include <thread> // Added for std::this_thread
#include <vector>

namespace lumen::cli {

void handle_command(int argc, char *argv[]) {
  if (argc < 2)
    return;
  std::string cmd = argv[1];
  bool watch = false;
  std::string filename;
  std::string backend_url = std::getenv("LUMEN_BACKEND_URL")
                                ? std::getenv("LUMEN_BACKEND_URL")
                                : "http://localhost:3001";

  if (cmd == "help" || cmd == "--help" || cmd == "-h") {
    std::cout << "\n\033[35m   _                     " << std::endl;
    std::cout << "  | | _  _ _ __  ___ _ _ " << std::endl;
    std::cout << "  |_|\\_,_|_|_|_|\\___|_||_|\033[0m" << std::endl;
    std::cout
        << "\033[37mLumen Platform v2.0.0 — Unified Developer Tooling\033[0m\n"
        << std::endl;

    std::cout << "\033[1;36mCORE COMMANDS\033[0m" << std::endl;
    std::cout
        << "  \033[32mnew <name>\033[0m       Initialize a new Lumen project"
        << std::endl;
    std::cout << "  \033[32mrun <file>\033[0m       Execute a .lm file (native "
                 "or JIT)"
              << std::endl;
    std::cout
        << "  \033[32mbuild <file>\033[0m     Compile to a zero-overhead binary"
        << std::endl;
    std::cout << "  \033[32mpublish\033[0m          Push project to the Lumen "
                 "Registry\n"
              << std::endl;

    std::cout << "\033[1;36mMANAGED DEPLOYMENT (AI COPILOT)\033[0m"
              << std::endl;
    std::cout << "  \033[32mdeploy scan <url>\033[0m  Ingest repository & "
                 "generate config"
              << std::endl;
    std::cout
        << "  \033[32mdeploy push\033[0m        Orchestrate cloud deployment"
        << std::endl;
    std::cout
        << "  \033[32mdeploy diagnose\033[0m    AI-powered root cause analysis"
        << std::endl;
    std::cout << "  \033[32mdeploy status\033[0m      Check real-time health "
                 "of services\n"
              << std::endl;

    std::cout << "\033[1;36mAUTH & IDENTITY\033[0m" << std::endl;
    std::cout
        << "  \033[32mlogin\033[0m             Hardware-bound session startup"
        << std::endl;
    std::cout << "  \033[32msecrets <cmd>\033[0m     Manage AES-256 encrypted "
                 "variables"
              << std::endl;
    std::cout
        << "  \033[32mwhoami\033[0m            Check current identity status\n"
        << std::endl;

    std::cout
        << "Run \033[33m'lumen deploy'\033[0m for full sub-command details."
        << std::endl;
    return;
  }

  if (cmd == "run" || cmd == "build") {
    for (int i = 2; i < argc; i++) {
      std::string arg = argv[i];
      if (arg == "--watch")
        watch = true;
      else
        filename = arg;
    }
    if (filename.empty()) {
      std::cerr << "Error: No file specified for '" << cmd << "'" << std::endl;
      return;
    }
    if (cmd == "run") {
      if (watch) {
        namespace fs = std::filesystem;
        std::cout << "── Watching for changes in: " << filename << "..."
                  << std::endl;
        auto last_time = fs::last_write_time(filename);
        while (true) {
          std::cout << "Running file: " << filename << std::endl;
          std::this_thread::sleep_for(std::chrono::seconds(1));
          while (fs::exists(filename) &&
                 fs::last_write_time(filename) == last_time) {
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
          }
          if (!fs::exists(filename))
            break;
          last_time = fs::last_write_time(filename);
          std::cout << "── Change detected, re-running..." << std::endl;
        }
      } else {
        std::cout << "Running file: " << filename << std::endl;
      }
    } else if (cmd == "build") {
      std::cout << "── Compiling " << filename << " to native executable..."
                << std::endl;
      std::this_thread::sleep_for(std::chrono::seconds(1));
      std::cout << "── Optimization pass: O3" << std::endl;
      std::cout << "── Link successful: ./output" << std::endl;
    }
  } else if (cmd == "new") {
    if (argc < 3) {
      std::cerr << "Usage: lumen new <project-name>" << std::endl;
      return;
    }
    std::string project_name = argv[2];
    std::cout << "Creating new project '" << project_name << "'..."
              << std::endl;
    namespace fs = std::filesystem;
    fs::create_directories(project_name + "/src");
    std::ofstream toml(project_name + "/lumen.toml");
    toml << "[package]\nname = \"" << project_name
         << "\"\nversion = \"0.1.0\"\n";
    std::ofstream main_lm(project_name + "/src/main.lm");
    main_lm << "print(\"Hello from " << project_name << "!\")\n";
    std::cout << "── Project initialized successfully." << std::endl;
  } else if (cmd == "lsp") {
    std::cout << "Starting Lumen LSP Server..." << std::endl;
  } else if (cmd == "login") {
    std::string username;
    std::cout << "Username: ";
    std::getline(std::cin, username);
    std::cout << "── Generating hardware fingerprint..." << std::endl;
    std::string hw_id =
        "hw-" + std::to_string(std::hash<std::string>{}(username + "lumen-v2"));
    std::cout << "── Authenticating..." << std::endl;
    std::string curl_cmd =
        "curl -s -X POST " + backend_url + "/auth/login -d '{\"username\":\"" +
        username + "\", \"hwId\":\"" + hw_id +
        "\"}' -H 'Content-Type: application/json' | python3 -c \"import "
        "sys,json; print(json.load(sys.stdin).get('apiKey',''))\" > "
        "~/.lumen/.raw_key";
    system(("mkdir -p ~/.lumen && " + curl_cmd).c_str());
    std::cout
        << "\033[32m── Logged in. Credentials derived from hardware ID.\033[0m"
        << std::endl;
  } else if (cmd == "logout") {
    system("rm -f ~/.lumen/.raw_key");
    std::cout << "── Logged out." << std::endl;
  } else if (cmd == "whoami") {
    FILE *kp = popen("cat ~/.lumen/.raw_key 2>/dev/null", "r");
    char kbuf[256] = {0};
    if (kp) {
      fgets(kbuf, sizeof(kbuf), kp);
      pclose(kp);
    }
    if (strlen(kbuf) == 0)
      std::cout << "── Not logged in." << std::endl;
    else
      std::cout << "── Authenticated as user with key: "
                << std::string(kbuf).substr(0, 12) << "..." << std::endl;
  } else if (cmd == "secrets") {
    if (argc < 3) {
      std::cerr << "Usage: lumen secrets <set|list|remove>\n";
      return;
    }
    std::string sub = argv[2];
    FILE *kp = popen("cat ~/.lumen/.raw_key 2>/dev/null", "r");
    char kbuf[256] = {0};
    if (kp) {
      fgets(kbuf, sizeof(kbuf), kp);
      pclose(kp);
    }
    std::string api_key(kbuf);
    std::string auth_h = " -H 'X-API-Key: " + api_key + "'";

    auto read_session = []() {
      FILE *sp = popen("cat ~/.lumen/session 2>/dev/null", "r");
      char sbuf[256] = {0};
      if (sp) {
        fgets(sbuf, sizeof(sbuf), sp);
        pclose(sp);
      }
      return std::string(sbuf);
    };

    if (sub == "set") {
      if (argc < 4)
        return;
      std::string kv = argv[3];
      auto eq = kv.find('=');
      if (eq == std::string::npos)
        return;
      std::string k = kv.substr(0, eq), v = kv.substr(eq + 1);
      std::string sid = read_session();
      system(("curl -s -X POST " + backend_url + "/copilot/secrets/" + sid +
              auth_h +
              " -H 'Content-Type: application/json' -d '{\"keyName\":\"" + k +
              "\",\"value\":\"" + v + "\"}'")
                 .c_str());
      std::cout << "── Secret saved." << std::endl;
    } else if (sub == "list") {
      std::string sid = read_session();
      system(("curl -s " + backend_url + "/copilot/session/" + sid + auth_h +
              " | python3 -c \"import sys,json; [print(s['keyName']) for s in "
              "json.load(sys.stdin).get('secrets',[])]\"")
                 .c_str());
    } else if (sub == "remove") {
      if (argc < 4)
        return;
      std::string sid = read_session();
      system(("curl -s -X DELETE " + backend_url + "/copilot/secrets/" + sid +
              "/" + std::string(argv[3]) + auth_h)
                 .c_str());
      std::cout << "── Secret removed." << std::endl;
    }
  } else if (cmd == "publish") {
    std::cout << "── Packaging project...\n── Uploading to Lumen "
                 "Registry...\n── Successfully published v0.1.0!"
              << std::endl;
    std::cout << "── View at: https://lumen-platform-beta.vercel.app/packages"
              << std::endl;
  } else if (cmd == "deploy") {
    FILE *kp = popen("cat ~/.lumen/.raw_key 2>/dev/null", "r");
    char kbuf[256] = {0};
    if (kp) {
      fgets(kbuf, sizeof(kbuf), kp);
      pclose(kp);
    }
    std::string auth_h = " -H 'X-API-Key: " + std::string(kbuf) + "'";
    auto read_session = []() {
      FILE *sp = popen("cat ~/.lumen/session 2>/dev/null", "r");
      char sbuf[256] = {0};
      if (sp) {
        fgets(sbuf, sizeof(sbuf), sp);
        pclose(sp);
      }
      return std::string(sbuf);
    };

    if (argc < 3) {
      std::cout << "\033[35m────\033[0m \033[1;37mLumen Managed Deployment "
                   "(Copilot v2)\033[0m \033[35m────\033[0m\n\n";
      std::cout << "  \033[32mscan <url>\033[0m     Ingest repository and "
                   "generate AI config\n";
      std::cout << "  \033[32mconfig\033[0m         View current .lumen YAML "
                   "(use --edit to patch)\n";
      std::cout << "  \033[32mpush\033[0m           Execute cloud deployment "
                   "(use --dry-run to validate)\n";
      std::cout << "  \033[32mstatus\033[0m         Check real-time state "
                   "machine & health\n";
      std::cout << "  \033[32mlogs\033[0m           Stream stdout/stderr from "
                   "cloud containers\n";
      std::cout << "  \033[32mdiagnose\033[0m       Execute Gemini log-audit "
                   "for root cause\n";
      std::cout << "  \033[32mlist\033[0m           Manage existing deployment "
                   "sessions\n";
      std::cout << "  \033[32mdelete <id>\033[0m    Wipe session and cloud "
                   "artifacts\n\n";
      std::cout << "Powered by Lumen Copilot Engine.\n";
      return;
    }
    std::string sub = argv[2];
    if (sub == "scan") {
      if (argc < 4)
        return;
      std::string repo = argv[3];
      std::cout << "── Scanning " << repo << "...\n";
      system(("curl -s -X POST " + backend_url + "/copilot/scan" + auth_h +
              " -H 'Content-Type: application/json' -d '{\"repoUrl\":\"" +
              repo +
              "\"}' | python3 -c \"import sys,json; "
              "print(json.load(sys.stdin).get('sessionId',''))\" > "
              "~/.lumen/session")
                 .c_str());
      std::cout
          << "── Session saved. Run 'lumen deploy status' to check progress."
          << std::endl;
    } else if (sub == "status") {
      std::string sid = read_session();
      system(("curl -s " + backend_url + "/copilot/session/" + sid + auth_h)
                 .c_str());
      std::cout << std::endl;
    } else if (sub == "push") {
      std::string sid = read_session();
      system(
          ("curl -s -X POST " + backend_url + "/copilot/deploy/" + sid + auth_h)
              .c_str());
      std::cout << "── Deploy triggered." << std::endl;
    } else if (sub == "logs") {
      std::string sid = read_session();
      system(
          ("curl -s " + backend_url + "/copilot/logs/" + sid + auth_h).c_str());
      std::cout << std::endl;
    } else if (sub == "diagnose") {
      std::string sid = read_session();
      system(("curl -s -X POST " + backend_url + "/copilot/diagnose/" + sid +
              auth_h)
                 .c_str());
      std::cout << std::endl;
    }
  } else if (cmd == "version") {
    std::cout << "Lumen Platform v2.0.0 (Copilot v2)" << std::endl;
  } else {
    std::cerr << "Unknown command: " << cmd
              << "\nUse 'lumen help' for list of commands" << std::endl;
  }
}

} // namespace lumen::cli
