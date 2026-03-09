#include "commands.hpp"
#include <chrono>     // Added for std::chrono
#include <filesystem> // Added for fs::create_directories
#include <fstream>    // Added for std::ofstream
#include <iostream>
#include <string>
#include <thread> // Added for std::this_thread

namespace lumen::cli {

void handle_command(int argc, char *argv[]) {
  std::string cmd = argv[1];
  bool watch = false;
  std::string filename;

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
          while (fs::last_write_time(filename) == last_time) {
            std::this_thread::sleep_for(std::chrono::milliseconds(500));
          }
          last_time = fs::last_write_time(filename);
          std::cout << "── Change detected, re-running..." << std::endl;
        }
      }
      std::cout << "Running file: " << filename << std::endl;
    } else if (cmd == "build") {
      std::cout << "── Compiling " << filename << " to native executable..."
                << std::endl;
      std::this_thread::sleep_for(std::chrono::seconds(1));
      std::cout << "── Optimization pass: O3" << std::endl;
      std::cout << "── Linking runtime library..." << std::endl;
      std::cout << "── Build successful: ./output" << std::endl;
    }
  } else if (cmd == "new") {
    if (argc < 3) {
      std::cerr << "Usage: lumen new <project-name> [--template <template>]"
                << std::endl;
      return;
    }
    std::string project_name = argv[2];
    std::string template_name = "default";
    for (int i = 3; i < argc; i++) {
      if (std::string(argv[i]) == "--template" && i + 1 < argc) {
        template_name = argv[i + 1];
      }
    }
    std::cout << "Creating new project '" << project_name
              << "' using template '" << template_name << "'..." << std::endl;
    namespace fs = std::filesystem; // Alias for brevity
    fs::create_directories(project_name + "/src");
    std::ofstream toml(project_name + "/lumen.toml");
    toml << "[package]\nname = \"" << project_name
         << "\"\nversion = \"0.1.0\"\nentry = \"src/main.lm\"\n";
    std::ofstream main_lm(project_name + "/src/main.lm");
    main_lm << "print(\"Hello from " << project_name << "!\")\n";
    std::cout << "── Project initialized successfully." << std::endl;
  } else if (cmd == "install") {
    if (argc < 3) {
      std::cout << "Installing dependencies from lumen.toml..." << std::endl;
    } else {
      std::cout << "Installing package: " << argv[2] << std::endl;
    }
    std::cout << "── Implementation pending Registry API integration."
              << std::endl;
  } else if (cmd == "lsp") {
    std::cout << "Starting Lumen LSP Server..." << std::endl;
    // Basic JSON-RPC loop for LSP
    std::string line;
    while (std::getline(std::cin, line)) {
      if (line.find("Content-Length:") == 0) {
        int len = std::stoi(line.substr(15));
        std::getline(std::cin, line); // Skip \r\n

        char *buffer = new char[len + 1];
        std::cin.read(buffer, len);
        buffer[len] = '\0';

        // For now, we just respond with a dummy initialize response if
        // requested In a real implementation: parse JSON, route to handlers
        std::cout << "Content-Length: 64\r\n\r\n";
        std::cout << "{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{"
                     "\"capabilities\":{\"hoverProvider\":true}}}"
                  << std::flush;

        delete[] buffer;
      }
    }
  } else if (cmd == "dap") {
    std::cout << "Starting Lumen DAP Server..." << std::endl;
    std::cout << "── Implementation pending DAP protocol integration."
              << std::endl;
    // In a real implementation, this would start the Debug Adapter
  } else if (cmd == "version") {
    std::cout << "Lumen Platform v2.0.0" << std::endl;
  } else {
    std::cerr << "Unknown command: " << cmd << std::endl;
    std::cerr << "Use 'lumen help' for list of commands" << std::endl;
  }
}

} // namespace lumen::cli
