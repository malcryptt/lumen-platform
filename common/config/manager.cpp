#include "manager.hpp"
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>

namespace fs = std::filesystem;

namespace lumen::config {

ConfigurationManager &ConfigurationManager::instance() {
  static ConfigurationManager inst;
  return inst;
}

void ConfigurationManager::load_system_config() {
  const char *home = getenv("HOME");
  if (!home)
    return;
  std::string path = std::string(home) + "/.lumen/config.toml";
  if (fs::exists(path)) {
    std::ifstream file(path);
    std::stringstream ss;
    ss << file.rdbuf();
    parse_toml(ss.str(), current_config);
  }
}

void ConfigurationManager::load_project_config(const std::string &path) {
  if (fs::exists(path)) {
    std::ifstream file(path);
    std::stringstream ss;
    ss << file.rdbuf();
    parse_toml(ss.str(), current_config);
  }
}

void ConfigurationManager::parse_toml(const std::string &content,
                                      Config &config) {
  // Basic hand-rolled parser for MVP
  std::stringstream ss(content);
  std::string line;
  while (std::getline(ss, line)) {
    if (line.empty() || line[0] == '#' || line[0] == '[')
      continue;

    size_t eq = line.find('=');
    if (eq != std::string::npos) {
      std::string key = line.substr(0, eq);
      std::string val = line.substr(eq + 1);

      // Trim whitespace
      key.erase(0, key.find_first_not_of(" \t"));
      key.erase(key.find_last_not_of(" \t") + 1);
      val.erase(0, val.find_first_not_of(" \t\""));
      val.erase(val.find_last_not_of(" \t\"") + 1);

      if (key == "prompt")
        config.shell_prompt = val;
      else if (key == "history_size")
        config.history_size = std::stoi(val);
      else if (key == "jit")
        config.jit_enabled = (val == "true");
      else if (key == "registry")
        config.registry_url = val;
    }
  }
}

} // namespace lumen::config
