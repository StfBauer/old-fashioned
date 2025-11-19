# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-19

### Added
- Comprehensive test infrastructure with 90.8% test coverage
- Enhanced CSS variables handling with smart empty line logic
- Better error handling for custom sorting strategies
- Improved mock setup for VS Code extension testing

### Changed
- Updated all dependencies to latest versions across monorepo
- Fixed VS Code engine compatibility (now requires VS Code ^1.106.0)
- Improved sorting algorithm stability and reliability
- Enhanced property grouping logic for better consistency

### Fixed
- Resolved test configuration issues after dependency updates
- Fixed custom strategy error handling when propertyGroups missing
- Fixed CSS variables empty line behavior
- Removed problematic empty test files
- Fixed hoisting errors in test mocks

## [0.0.3] - 2023-11-09

### Changed
- Updated funding information
- Fixed URLs in package.json
- Documentation improvements

## [0.0.2] - 2023-11-09

### Changed
- Updated version from 0.0.1 to 0.0.2

## [0.0.1] - 2025-05-16

### Initial release

- Added three sorting strategies: alphabetical, concentric, and idiomatic
- Support for CSS, SCSS, and SASS files
- Special handling for CSS variables, SASS variables, media queries, and nested rules
- Configurable property grouping with optional empty lines between groups
- Integration with VS Code's native formatting
- Customizable notification levels
- Option to format document before sorting
