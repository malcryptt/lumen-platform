#include "system_shell.hpp"
#include <fstream>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <sys/wait.h>
#include <unistd.h>
#include <vector>
#include <wordexp.h>

namespace lumen::shell {

std::map<std::string, std::string> aliases;

void load_lumenrc() {
  const char *home = getenv("HOME");
  if (!home)
    return;
  std::string rc_path = std::string(home) + "/.lumenrc";
  std::ifstream rc_file(rc_path);
  if (!rc_file.is_open())
    return;

  std::string line;
  while (std::getline(rc_file, line)) {
    if (line.compare(0, 13, "shell.alias(\"") == 0) {
      // Very basic parser: shell.alias("ll", "ls -la")
      size_t first_quote = line.find("\"");
      size_t second_quote = line.find("\"", first_quote + 1);
      size_t third_quote = line.find("\"", second_quote + 1);
      size_t fourth_quote = line.find("\"", third_quote + 1);
      if (first_quote != std::string::npos &&
          fourth_quote != std::string::npos) {
        std::string key =
            line.substr(first_quote + 1, second_quote - first_quote - 1);
        std::string val =
            line.substr(third_quote + 1, fourth_quote - third_quote - 1);
        aliases[key] = val;
      }
    }
  }
}

void execute_pipeline(const std::string &line) {
  std::vector<std::string> commands;
  std::stringstream ss(line);
  std::string item;
  while (std::getline(ss, item, '|')) {
    commands.push_back(item);
  }

  int num_cmds = commands.size();
  int pipes[2 * (num_cmds - 1)];

  for (int i = 0; i < num_cmds - 1; i++) {
    if (pipe(pipes + i * 2) < 0) {
      perror("pipe");
      return;
    }
  }

  for (int i = 0; i < num_cmds; i++) {
    pid_t pid = fork();
    if (pid == 0) {
      // If not first command, read from previous pipe
      if (i > 0) {
        dup2(pipes[(i - 1) * 2], STDIN_FILENO);
      }
      // If not last command, write to current pipe
      if (i < num_cmds - 1) {
        dup2(pipes[i * 2 + 1], STDOUT_FILENO);
      }

      // Close all pipes in child
      for (int j = 0; j < 2 * (num_cmds - 1); j++) {
        close(pipes[j]);
      }

      wordexp_t exp;
      wordexp(commands[i].c_str(), &exp, 0);
      if (exp.we_wordc > 0) {
        execvp(exp.we_wordv[0], exp.we_wordv);
        perror("execvp");
      }
      wordfree(&exp);
      exit(1);
    } else if (pid < 0) {
      perror("fork");
      return;
    }
  }

  // Close all pipes in parent
  for (int i = 0; i < 2 * (num_cmds - 1); i++) {
    close(pipes[i]);
  }

  // Wait for all children
  for (int i = 0; i < num_cmds; i++) {
    wait(NULL);
  }
}

void start_system_shell() {
  load_lumenrc();

  std::string line;
  while (true) {
    char cwd[1024];
    if (getcwd(cwd, sizeof(cwd)) != nullptr) {
      std::cout << "\033[32m[lumen-sh]\033[0m \033[34m" << cwd << "\033[0m $ ";
    } else {
      std::cout << "[lumen-sh] $ ";
    }

    if (!std::getline(std::cin, line))
      break;
    if (line.empty())
      continue;
    if (line == "exit" || line == "quit")
      break;

    // Check aliases
    if (aliases.count(line)) {
      line = aliases[line];
    }

    if (line.find('|') != std::string::npos) {
      execute_pipeline(line);
    } else {
      // Basic command execution for lumen-sh
      wordexp_t exp;
      int res = wordexp(line.c_str(), &exp, 0);
      if (res != 0) {
        std::cerr << "Error parsing command" << std::endl;
        continue;
      }

      if (exp.we_wordc > 0) {
        std::string cmd = exp.we_wordv[0];
        if (cmd == "cd") {
          if (exp.we_wordc > 1) {
            if (chdir(exp.we_wordv[1]) != 0) {
              perror("cd");
            }
          }
        } else {
          pid_t pid = fork();
          if (pid == 0) {
            execvp(exp.we_wordv[0], exp.we_wordv);
            perror("execvp");
            exit(1);
          } else {
            int status;
            waitpid(pid, &status, 0);
          }
        }
      }
      wordfree(&exp);
    }
  }
}

} // namespace lumen::shell
