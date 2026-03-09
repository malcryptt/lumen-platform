#include "cli/commands.hpp"
#include "config/manager.hpp"
#include "shell/repl.hpp"
#include "shell/system_shell.hpp"
#include <filesystem>
#include <iostream>
#include <string>
#include <vector>

namespace fs = std::filesystem;

int main(int argc, char *argv[]) {
  // Load configurations
  lumen::config::ConfigurationManager::instance().load_system_config();
  // Project config loading will be handled based on CWD or --project flag in
  // future

  std::string program_name = fs::path(argv[0]).filename().string();

  if (program_name == "lumen-sh") {
    lumen::shell::start_system_shell();
    return 0;
  }

  if (argc >= 2) {
    std::string command = argv[1];
    if (command == "shell") {
      lumen::shell::start_repl();
    } else if (command == "system-shell") {
      lumen::shell::start_system_shell();
    } else if (command == "run") {
      lumen::cli::handle_command(argc, argv);
    } else if (fs::exists(command)) {
      // Treat as running a script directly
      char *new_argv[argc + 1];
      new_argv[0] = (char *)"lumen";
      new_argv[1] = (char *)"run";
      for (int i = 1; i < argc; i++)
        new_argv[i + 1] = argv[i];
      lumen::cli::handle_command(argc + 1, new_argv);
    } else {
      lumen::cli::handle_command(argc, argv);
    }
    return 0;
  }

  // If argc < 2 and not lumen-sh, start REPL
  lumen::shell::start_repl();
  return 0;
}
