# Changelog

## [1.0.1] - 2026-01-13

### Added
- **Test Case Lookup**: SDK now searches for existing test cases by ID or title before creating new ones
- **Execution History**: Results are now recorded against existing test cases, building execution history
- **Smart Mapping**: 
  - If `testCaseId` is provided → Uses existing test case by ID
  - If not found or not provided → Searches by title/name
  - If found → Uses existing test case and records result
  - If not found → Creates new test case, then records result

### Enhanced
- `EZTestClient.findOrCreateTestCase()` - New method to find existing test cases
- `EZTestClient.getTestCaseById()` - Get test case by ID
- `EZTestClient.searchTestCases()` - Search test cases by title/name
- All importers (JSON, HTML, TestNG) now use smart test case lookup

### Behavior Changes
- **Before**: SDK always created new test cases, leading to duplicates
- **After**: SDK checks for existing test cases first, only creates if not found
- Execution results are now properly linked to existing test cases, building execution history

## [1.0.0] - 2026-01-12

### Initial Release
- TestNG listener for automatic test execution tracking
- JSON report import (ExtentSparkReporter format)
- HTML report import (ExtentReports, TestNG, generic formats)
- Programmatic API for full control
- REST API communication only (no database access)
- Independent and portable SDK design

