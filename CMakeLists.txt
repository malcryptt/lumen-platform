cmake_minimum_required(VERSION 3.10)
project(lumen-platform LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# External dependencies (to be added as needed)
# include(FetchContent)

add_subdirectory(lumen-cli)

# We'll add more subdirectories as we implement other components
