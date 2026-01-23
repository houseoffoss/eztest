# EZTest Integrations

This directory contains guides for integrating EZTest with automation tools and CI/CD pipelines.

## Available Integrations

### TestNG / Maven Integration

**Guide:** [TestNG Maven Integration](./testng-maven-integration.md)

Automatically upload TestNG XML test results to EZTest when running `mvn clean verify` or `mvn test`.

**Features:**
- ✅ Automatic upload after test execution (verify phase)
- ✅ Works even if tests fail
- ✅ No TestNG listeners required
- ✅ No manual steps
- ✅ Secure `.env`-based configuration
- ✅ Binary file streaming for reliability

**Use Case:** Java/TestNG projects using Maven build system.

---

## Integration Overview

EZTest supports importing test execution results from automation tools via:

1. **TestNG XML Import** - Upload TestNG XML result files automatically via Maven
2. **API Integration** - Direct API calls for custom integrations

### Supported Formats

- **TestNG XML** - Standard TestNG result format with metadata
- **Custom XML** - Via API endpoints

### Integration Methods

1. **Maven Plugin** - Automatic upload after test execution (recommended)
2. **File Upload** - Upload XML files via UI or API
3. **API Endpoints** - Direct integration via REST API

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

## Core Logic: EZTestCreateTestRunUploader.java

The uploader utility handles:

- **Environment Configuration**: Loads credentials from `.env` file
- **Authentication**: Bearer token-based API authentication
- **Binary Upload**: Efficient streaming of XML files
- **Error Handling**: Comprehensive error messages and response validation
- **URL Construction**: Proper encoding of project IDs and parameters

See the [TestNG Maven Integration](./testng-maven-integration.md#step-1-add-required-java-files) guide for complete implementation details.

---

## Maven Lifecycle Integration

The integration uses Maven's `verify` phase to trigger uploads:

```bash
mvn clean verify
```

This ensures:
- Tests run first
- All test phases complete
- Upload happens automatically
- Build fails if upload fails
- Results sync to EZTest dashboard

---

## Environment Setup

Create a `.env` file in your project root:

```env
EZTEST_BASE_URL=https://api.eztest.io
EZTEST_API_TOKEN=your_secret_api_token
EZTEST_PROJECT_ID=your_project_unique_id
EZTEST_ENVIRONMENT=QA_Staging
```

**Never commit `.env` to version control** - Add to `.gitignore`

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

**Last Updated:** 2026-01-23

