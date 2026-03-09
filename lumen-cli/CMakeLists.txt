cmake_minimum_required(VERSION 3.10)
project(lumen-cli LANGUAGES CXX)

# Sources
set(LUMEN_CLI_SOURCES
    src/main.cpp
    src/shell/repl.cpp
    src/shell/system_shell.cpp
    src/cli/commands.cpp
    ../common/config/manager.cpp
)

add_executable(lumen ${LUMEN_CLI_SOURCES})

target_include_directories(lumen PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/../common
)

# For now, just a dummy main
