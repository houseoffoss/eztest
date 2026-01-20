# EZTest Integrations

This directory contains guides for integrating EZTest with automation tools and CI/CD pipelines.

## Available Integrations

### TestNG / Maven Integration

**Guide:** [TestNG Maven Integration](./testng-maven-integration.md)

Automatically upload TestNG test results to EZTest when running `mvn test`.

**Features:**
- ✅ Automatic upload after test execution
- ✅ Works even if tests fail
- ✅ No TestNG listeners required
- ✅ No manual steps

**Use Case:** Java/TestNG projects using Maven build system.

---

## Integration Overview

EZTest supports importing test execution results from automation tools via:

1. **TestNG XML Import** - Upload TestNG XML result files
2. **API Integration** - Direct API calls for custom integrations
### Supported Formats

- **TestNG XML** - Standard TestNG result format
- **Custom XML** - Via API endpoints

### Integration Methods

1. **File Upload** - Upload XML files via UI or API
2. **API Endpoints** - Direct integration via REST API
3. **Maven Plugin** - Automatic upload after test execution

---

## Getting Started

1. **Choose your integration method** from the available guides
2. **Set up API authentication** - Generate API token in EZTest
3. **Configure your automation tool** - Follow the specific guide
4. **Test the integration** - Run a test and verify upload

---

## API Authentication

All integrations require API authentication:

1. Navigate to **Accounts** → **API Keys** in EZTest
2. Click **"Create API Key"**
3. Copy the generated token
4. Use token in your integration configuration

**Required Permission:** `testruns:create`

---

## Related Documentation

- [Test Runs Feature Guide](../features/test-runs/README.md)
- [Test Runs API Reference](../api/test-runs.md)
- [API Overview](../api/README.md)

---

## Contributing

If you've created an integration for another tool, please contribute it:

1. Create a new markdown file in this directory
2. Follow the format of existing integration guides
3. Submit a pull request

---

**Last Updated:** 2026-01-13

