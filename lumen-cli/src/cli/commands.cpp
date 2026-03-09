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

  if (cmd == "run") {
    bool watch = false;
    std::string filename;
    for (int i = 2; i < argc; i++) {
      std::string arg = argv[i];
      if (arg == "--watch")
        watch = true;
      else
        filename = arg;
    }
    if (filename.empty()) {
      std::cerr << "Error: No file specified for 'run'" << std::endl;
      return;
    }
    if (watch) {
      namespace fs = std::filesystem; // Alias for brevity
      std::cout << "── Watching for changes in: " << filename << "..."
                << std::endl;
      auto last_time = fs::last_write_time(filename);
      while (true) {
        std::cout << "Running file: " << filename << std::endl;
        // Mock execution
        std::this_thread::sleep_for(std::chrono::seconds(2));

        while (fs::last_write_time(filename) == last_time) {
          std::this_thread::sleep_for(std::chrono::milliseconds(500));
        }
        last_time = fs::last_write_time(filename);
        std::cout << "── Change detected, re-running..." << std::endl;
      }
    }
    std::cout << "Running file: " << filename << std::endl;
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
    std::cout << "── Implementation pending LSP protocol integration."
              << std::endl;
    // In a real implementation, this would start the LSP server loop
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
