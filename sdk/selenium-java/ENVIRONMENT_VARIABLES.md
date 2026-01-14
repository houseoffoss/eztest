# Environment Variables Configuration

This document lists all environment variables and system properties that can be used to configure the EZTest Selenium Java SDK.

## Required Configuration

The SDK requires three essential configuration values:

1. **Server URL** - Your EZTest instance URL
2. **API Key** - Authentication key for EZTest API
3. **Project ID** - The EZTest project ID to associate tests with

> **Multiple Projects Support**: The SDK supports multiple projects! You can:
> - Use `@EZTestProject` annotation to specify different projects per test class
> - Override project ID at class or method level
> - Use different API keys per project if needed
> See [Multiple Projects](#multiple-projects-support) section below.

## Environment Variables

### Primary Variables

| Variable Name | Description | Example | Required |
|--------------|-------------|---------|----------|
| `EZTEST_SERVER_URL` | Base URL of your EZTest instance | `https://eztest.example.com` or `http://localhost:3000` | ✅ Yes |
| `EZTEST_API_KEY` | API key for authentication | `ez_abc123...` (API key) | ✅ Yes |
| `EZTEST_PROJECT_ID` | Project ID in EZTest | `proj_abc123` | ✅ Yes |

### Optional Variables

| Variable Name | Description | Example | Default |
|--------------|-------------|---------|---------|
| `EZTEST_ENVIRONMENT` | Environment name for test runs | `Staging`, `Production`, `QA` | `AUTOMATION` |
| `EZTEST_CONNECT_TIMEOUT_MS` | Connection timeout in milliseconds | `60000` | `30000` (30 seconds) |
| `EZTEST_READ_TIMEOUT_MS` | Read timeout in milliseconds | `120000` | `60000` (60 seconds) |

## System Properties

You can also use Java system properties (same names, lowercase with dots):

| System Property | Environment Variable Equivalent | Example |
|----------------|--------------------------------|---------|
| `eztest.server.url` | `EZTEST_SERVER_URL` | `-Deztest.server.url=https://eztest.example.com` |
| `eztest.api.key` | `EZTEST_API_KEY` | `-Deztest.api.key=your-api-key` |
| `eztest.project.id` | `EZTEST_PROJECT_ID` | `-Deztest.project.id=proj_abc123` |
| `eztest.environment` | `EZTEST_ENVIRONMENT` | `-Deztest.environment=Staging` |

## Configuration Methods

### Method 1: Environment Variables (Recommended for CI/CD)

**Windows (PowerShell):**
```powershell
$env:EZTEST_SERVER_URL = "https://eztest.example.com"
$env:EZTEST_API_KEY = "your-api-key"
$env:EZTEST_PROJECT_ID = "proj_abc123"
$env:EZTEST_ENVIRONMENT = "Staging"
```

**Windows (Command Prompt):**
```cmd
set EZTEST_SERVER_URL=https://eztest.example.com
set EZTEST_API_KEY=your-api-key
set EZTEST_PROJECT_ID=proj_abc123
set EZTEST_ENVIRONMENT=Staging
```

**Linux/Mac (Bash):**
```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_abc123
export EZTEST_ENVIRONMENT=Staging
```

**Permanent (Windows - System Properties):**
1. Right-click "This PC" → Properties
2. Advanced system settings → Environment Variables
3. Add new variables under "User variables" or "System variables"

**Permanent (Linux/Mac - ~/.bashrc or ~/.zshrc):**
```bash
echo 'export EZTEST_SERVER_URL=https://eztest.example.com' >> ~/.bashrc
echo 'export EZTEST_API_KEY=your-api-key' >> ~/.bashrc
echo 'export EZTEST_PROJECT_ID=proj_abc123' >> ~/.bashrc
source ~/.bashrc
```

### Method 2: System Properties (Java Command Line)

```bash
java -Deztest.server.url=https://eztest.example.com \
     -Deztest.api.key=your-api-key \
     -Deztest.project.id=proj_abc123 \
     -Deztest.environment=Staging \
     YourTestClass
```

**Maven:**
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <systemPropertyVariables>
            <eztest.server.url>https://eztest.example.com</eztest.server.url>
            <eztest.api.key>your-api-key</eztest.api.key>
            <eztest.project.id>proj_abc123</eztest.project.id>
            <eztest.environment>Staging</eztest.environment>
        </systemPropertyVariables>
    </configuration>
</plugin>
```

### Method 3: Programmatic Configuration

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestClient;

EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",  // Server URL
    "your-api-key",                 // API Key
    "proj_abc123",                  // Project ID
    60000,                          // Connect timeout (optional)
    120000                          // Read timeout (optional)
);

EZTestClient client = new EZTestClient(config);
```

## Priority Order

The SDK checks configuration in this order:

1. **Programmatic** - If you create `EZTestConfig` directly and call `listener.initialize(config)`
   - The project ID in this config becomes the **default project**
   - Tests without `@EZTestProject` annotation will use this default
   - **Environment variables are NOT needed** if you use programmatic config
   - Programmatic config **overrides** environment variables
2. **System Properties** - Java `-D` flags (if no programmatic config)
3. **Environment Variables** - OS environment variables (if no programmatic config or system properties)

### Important: Programmatic Config vs Environment Variables

**If you use `EZTestConfig` programmatically:**
- ✅ **You DON'T need environment variables** - The config provides all values
- ✅ Programmatic config **overrides** environment variables
- ✅ All values (server URL, API key, project ID) come from the config object

**Example:**
```java
// Programmatic config - NO environment variables needed
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",  // Server URL (from config)
    "your-api-key",                  // API Key (from config)
    "proj_main"                      // Project ID (from config)
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// Even if EZTEST_PROJECT_ID env var is set, it will be IGNORED
// The project ID "proj_main" from config will be used instead
```

**If you DON'T use programmatic config:**
- ✅ **You NEED environment variables** (or system properties)
- ✅ SDK will read from environment variables automatically

### Default Project Selection

The **default project** is determined by:
- **Programmatic config** (if provided via `EZTestConfig`) - **Highest priority**
- **Environment variable** `EZTEST_PROJECT_ID` (if no programmatic config)
- **System property** `eztest.project.id` (if no programmatic config or env var)

Tests with `@EZTestProject` annotation will override the default project.

## CI/CD Integration Examples

### Jenkins

**Using Environment Variables:**
```groovy
pipeline {
    agent any
    environment {
        EZTEST_SERVER_URL = 'https://eztest.example.com'
        EZTEST_API_KEY = credentials('eztest-api-key')
        EZTEST_PROJECT_ID = 'proj_abc123'
        EZTEST_ENVIRONMENT = 'CI'
    }
    stages {
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
    }
}
```

**Using Credentials:**
```groovy
withCredentials([string(credentialsId: 'eztest-api-key', variable: 'EZTEST_API_KEY')]) {
    sh '''
        export EZTEST_SERVER_URL=https://eztest.example.com
        export EZTEST_PROJECT_ID=proj_abc123
        mvn test
    '''
}
```

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      EZTEST_SERVER_URL: https://eztest.example.com
      EZTEST_API_KEY: ${{ secrets.EZTEST_API_KEY }}
      EZTEST_PROJECT_ID: ${{ secrets.EZTEST_PROJECT_ID }}
      EZTEST_ENVIRONMENT: CI
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '11'
      - run: mvn test
```

### GitLab CI

```yaml
variables:
  EZTEST_SERVER_URL: "https://eztest.example.com"
  EZTEST_PROJECT_ID: "proj_abc123"
  EZTEST_ENVIRONMENT: "CI"

test:
  script:
    - mvn test
  environment:
    EZTEST_API_KEY: $EZTEST_API_KEY  # Set in GitLab CI/CD variables
```

### Azure DevOps

```yaml
variables:
  EZTEST_SERVER_URL: 'https://eztest.example.com'
  EZTEST_PROJECT_ID: 'proj_abc123'
  EZTEST_ENVIRONMENT: 'CI'

steps:
- task: Maven@3
  inputs:
    mavenPomFile: 'pom.xml'
    goals: 'test'
  env:
    EZTEST_API_KEY: $(EZTEST_API_KEY)  # Set in Pipeline Variables
```

### Docker

**Using Environment Variables:**
```dockerfile
ENV EZTEST_SERVER_URL=https://eztest.example.com
ENV EZTEST_PROJECT_ID=proj_abc123
ENV EZTEST_ENVIRONMENT=Docker

# API key should be passed at runtime for security
docker run -e EZTEST_API_KEY=your-api-key your-image
```

**docker-compose.yml:**
```yaml
services:
  tests:
    image: your-test-image
    environment:
      - EZTEST_SERVER_URL=https://eztest.example.com
      - EZTEST_API_KEY=${EZTEST_API_KEY}
      - EZTEST_PROJECT_ID=proj_abc123
      - EZTEST_ENVIRONMENT=Docker
```

## Security Best Practices

### ✅ DO:

1. **Use Secrets Management**:
   - Store API keys in CI/CD secret stores (GitHub Secrets, Jenkins Credentials, etc.)
   - Never commit API keys to version control
   - Use environment variables in CI/CD pipelines

2. **Use Different Keys per Environment**:
   - Different API keys for dev/staging/production
   - Rotate keys regularly

3. **Limit API Key Permissions**:
   - Only grant necessary permissions (`testcases:create`, `testruns:create`, etc.)

### ❌ DON'T:

1. **Don't Hardcode**:
   ```java
   // ❌ BAD
   EZTestConfig config = new EZTestConfig(
       "https://eztest.example.com",
       "hardcoded-api-key-12345",  // Never do this!
       "proj_abc123"
   );
   ```

2. **Don't Commit Secrets**:
   - Never commit `.env` files with real API keys
   - Use `.env.example` with placeholder values

3. **Don't Log API Keys**:
   - SDK automatically avoids logging sensitive data
   - Be careful in your own code

## Example .env File (for local development)

Create a `.env` file (and add to `.gitignore`):

```bash
# EZTest Configuration
EZTEST_SERVER_URL=http://localhost:3000
EZTEST_API_KEY=your-local-api-key
EZTEST_PROJECT_ID=proj_local_test
EZTEST_ENVIRONMENT=Local
```

**Load in your code:**
```java
// Simple .env loader (you may want to use a library like dotenv-java)
String serverUrl = System.getenv("EZTEST_SERVER_URL");
String apiKey = System.getenv("EZTEST_API_KEY");
String projectId = System.getenv("EZTEST_PROJECT_ID");

EZTestConfig config = new EZTestConfig(serverUrl, apiKey, projectId);
```

## Verification

To verify your environment variables are set correctly:

**Windows (PowerShell):**
```powershell
echo $env:EZTEST_SERVER_URL
echo $env:EZTEST_API_KEY
echo $env:EZTEST_PROJECT_ID
```

**Linux/Mac:**
```bash
echo $EZTEST_SERVER_URL
echo $EZTEST_API_KEY
echo $EZTEST_PROJECT_ID
```

**Java Test:**
```java
public class TestConfig {
    public static void main(String[] args) {
        System.out.println("Server URL: " + System.getenv("EZTEST_SERVER_URL"));
        System.out.println("API Key: " + (System.getenv("EZTEST_API_KEY") != null ? "***SET***" : "NOT SET"));
        System.out.println("Project ID: " + System.getenv("EZTEST_PROJECT_ID"));
    }
}
```

## Troubleshooting

### Variables Not Found

**Issue**: SDK says configuration not found

**Solution**:
1. Verify variables are set: `echo $EZTEST_SERVER_URL` (or `$env:EZTEST_SERVER_URL` on Windows)
2. Restart your IDE/terminal after setting variables
3. Check variable names (case-sensitive on Linux/Mac)
4. Use programmatic configuration as fallback

### API Key Not Working

**Issue**: 401 Unauthorized errors

**Solution**:
1. Verify API key is correct
2. Check API key has required permissions
3. Ensure API key hasn't expired
4. Verify server URL is correct

### Project ID Not Found

**Issue**: 404 errors when creating test cases

**Solution**:
1. Verify project ID exists in EZTest
2. Check API key has access to the project
3. Verify project ID format is correct

## Choosing Specific Projects When Using Environment Variables

When you set `EZTEST_PROJECT_ID` as an environment variable, that becomes the **default project**. To use a **different project** for specific tests, use the `@EZTestProject` annotation.

### Example: Override Environment Variable Default

**Step 1: Set default project via environment variable**
```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_default  # Default project
```

**Step 2: Use default project (no annotation needed)**
```java
@Listeners(EZTestTestNGListener.class)
public class DefaultProjectTests {
    @EZTestCase(title = "Test 1")
    @Test
    public void test1() {
        // Uses proj_default from environment variable
    }
}
```

**Step 3: Override to use different project**
```java
// Override default project for this class
@EZTestProject(projectId = "proj_frontend")
@Listeners(EZTestTestNGListener.class)
public class FrontendTests {
    @EZTestCase(title = "UI Test")
    @Test
    public void testUI() {
        // Uses proj_frontend (overrides environment variable default)
    }
}

// Override at method level
@Listeners(EZTestTestNGListener.class)
public class MixedTests {
    @EZTestCase(title = "Default Test")
    @Test
    public void testDefault() {
        // Uses proj_default from environment variable
    }
    
    @EZTestProject(projectId = "proj_backend")
    @EZTestCase(title = "Backend Test")
    @Test
    public void testBackend() {
        // Uses proj_backend (overrides environment variable)
    }
}
```

### Complete Workflow

```bash
# Set default project in environment
export EZTEST_PROJECT_ID=proj_main
```

```java
// Most tests use default (proj_main from env)
@Listeners(EZTestTestNGListener.class)
public class MainTests {
    @EZTestCase(title = "Main Test")
    @Test
    public void test() {
        // Uses proj_main (from EZTEST_PROJECT_ID env var)
    }
}

// Some tests use different project
@EZTestProject(projectId = "proj_secondary")
@Listeners(EZTestTestNGListener.class)
public class SecondaryTests {
    @EZTestCase(title = "Secondary Test")
    @Test
    public void test() {
        // Uses proj_secondary (overrides env var)
    }
}
```

## Summary

**Minimum Required:**
- `EZTEST_SERVER_URL` (or `eztest.server.url`)
- `EZTEST_API_KEY` (or `eztest.api.key`)
- `EZTEST_PROJECT_ID` (or `eztest.project.id`) - Default project ID

**Optional:**
- `EZTEST_ENVIRONMENT` (defaults to "AUTOMATION")
- `EZTEST_CONNECT_TIMEOUT_MS` (defaults to 30000)
- `EZTEST_READ_TIMEOUT_MS` (defaults to 60000)

**Multiple Projects:**
- **Default Project**: Set via `EZTEST_PROJECT_ID` environment variable (or programmatic config)
- **Override Default**: Use `@EZTestProject` annotation to use different project for specific tests
- **Priority**: `@EZTestProject` annotation > Environment variable default
- Can specify different server URLs and API keys per project via annotation

