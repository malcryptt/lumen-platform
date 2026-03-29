#pragma once

#include <string>

namespace lumen::config {

struct Config {
  std::string shell_prompt = "lumen> ";
  int history_size = 10000;
  bool jit_enabled = true;
  std::string registry_url = "https://lumen-platform-beta.vercel.app/packages";
};

class ConfigurationManager {
public:
  static ConfigurationManager &instance();

  void load_system_config();
  void load_project_config(const std::string &path);

  const Config &get_config() const { return current_config; }

private:
  ConfigurationManager() = default;
  Config current_config;

  void parse_toml(const std::string &content, Config &config);
};

} // namespace lumen::config
