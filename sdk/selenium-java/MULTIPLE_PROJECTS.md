# Multiple Projects Support

This guide explains how to configure and use multiple EZTest projects with the SDK.

## Default Project Configuration

The SDK supports a **default project** that is used when tests don't have a `@EZTestProject` annotation. You can set the default project in three ways:

### 1. Programmatic Configuration (Recommended)

When you provide configuration programmatically via `EZTestConfig`, that project ID becomes the default project.

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.listeners.EZTestTestNGListener;

// Create configuration with your default project
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",  // Server URL
    "your-api-key",                 // API Key
    "proj_default"                  // Default Project ID
);

// Initialize listener
EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// All tests without @EZTestProject will use "proj_default"
```

**Important:**
- ✅ **Environment variables are NOT needed** when using programmatic config
- ✅ All values (server URL, API key, project ID) come from the `EZTestConfig` object
- ✅ Programmatic config **overrides** any environment variables that might be set

**Advantages:**
- ✅ Explicit and clear
- ✅ Easy to change programmatically
- ✅ Can be loaded from config files, databases, etc.
- ✅ Highest priority (overrides environment variables)
- ✅ No dependency on environment variables

### 2. Environment Variables

Set `EZTEST_PROJECT_ID` environment variable:

```bash
export EZTEST_PROJECT_ID=proj_default
```

**When used:**
- If no programmatic configuration is provided
- As fallback if programmatic config doesn't specify project ID

**How to Override:**
- Use `@EZTestProject` annotation on test class or method to override the environment variable default
- Tests without `@EZTestProject` will use the environment variable value

### 3. System Properties

Set `eztest.project.id` system property:

```bash
java -Deztest.project.id=proj_default YourTestClass
```

**When used:**
- If no programmatic configuration is provided
- Before checking environment variables

## Priority Order

The default project is determined by this priority order:

1. **Programmatic Config** (`EZTestConfig` via `initialize()`) - **Highest Priority**
2. **System Property** (`eztest.project.id`)
3. **Environment Variable** (`EZTEST_PROJECT_ID`)

## Overriding Default Project

You can override the default project for specific test classes or methods using `@EZTestProject` annotation:

```java
// Uses default project (from config/env)
@Listeners(EZTestTestNGListener.class)
public class DefaultProjectTests {
    @EZTestCase(title = "Test 1")
    @Test
    public void test1() {
        // Uses default project
    }
}

// Overrides default project
@EZTestProject(projectId = "proj_custom")
@Listeners(EZTestTestNGListener.class)
public class CustomProjectTests {
    @EZTestCase(title = "Test 2")
    @Test
    public void test2() {
        // Uses proj_custom (overrides default)
    }
}
```

## Complete Example

```java
import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.annotations.EZTestProject;
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

public class MultipleProjectsExample {
    
    // Setup default project programmatically
    static {
        EZTestConfig defaultConfig = new EZTestConfig(
            "https://eztest.example.com",
            "your-api-key",
            "proj_main"  // Default project
        );
        
        EZTestTestNGListener listener = new EZTestTestNGListener();
        listener.initialize(defaultConfig);
    }
    
    // Uses default project (proj_main)
    @Listeners(EZTestTestNGListener.class)
    public static class MainProjectTests {
        @EZTestCase(title = "Main Test")
        @Test
        public void testMain() {
            // Syncs to proj_main
        }
    }
    
    // Overrides to use different project
    @EZTestProject(projectId = "proj_secondary")
    @Listeners(EZTestTestNGListener.class)
    public static class SecondaryProjectTests {
        @EZTestCase(title = "Secondary Test")
        @Test
        public void testSecondary() {
            // Syncs to proj_secondary
        }
    }
    
    // Can also override at method level
    @Listeners(EZTestTestNGListener.class)
    public static class MixedTests {
        @EZTestCase(title = "Default Test")
        @Test
        public void testDefault() {
            // Uses default (proj_main)
        }
        
        @EZTestProject(projectId = "proj_special")
        @EZTestCase(title = "Special Test")
        @Test
        public void testSpecial() {
            // Uses proj_special (method-level override)
        }
    }
}
```

## Configuration Scenarios

### Scenario 1: Single Project (Default Only)

```java
// Set default project via config
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "api-key",
    "proj_single"
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// All tests use proj_single
@Listeners(EZTestTestNGListener.class)
public class AllTests {
    @EZTestCase(title = "Test")
    @Test
    public void test() {
        // Uses proj_single
    }
}
```

### Scenario 2: Multiple Projects with Default

```java
// Set default project
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "api-key",
    "proj_default"  // Default
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// Most tests use default
@Listeners(EZTestTestNGListener.class)
public class DefaultTests {
    @EZTestCase(title = "Test")
    @Test
    public void test() {
        // Uses proj_default
    }
}

// Some tests use different project
@EZTestProject(projectId = "proj_special")
@Listeners(EZTestTestNGListener.class)
public class SpecialTests {
    @EZTestCase(title = "Test")
    @Test
    public void test() {
        // Uses proj_special
    }
}
```

### Scenario 3: Environment-Based Default

```bash
# Set default via environment variable
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=api-key
export EZTEST_PROJECT_ID=proj_env_default
```

```java
// No programmatic config - uses environment variables
@Listeners(EZTestTestNGListener.class)
public class EnvBasedTests {
    @EZTestCase(title = "Test")
    @Test
    public void test() {
        // Uses proj_env_default from environment
    }
}
```

## Best Practices

1. **Set Default Programmatically**: Use `EZTestConfig` for explicit, clear configuration
2. **Use Environment Variables for CI/CD**: Set defaults via environment variables in CI/CD pipelines
3. **Override When Needed**: Use `@EZTestProject` only when you need a different project
4. **Document Your Projects**: Keep track of which tests sync to which projects
5. **Consistent Naming**: Use clear project IDs (e.g., `proj_frontend`, `proj_backend`)

## Troubleshooting

### Default Project Not Working

**Issue**: Tests not using expected default project

**Check:**
1. Did you call `listener.initialize(config)` with your config?
2. Is the project ID correct in your config?
3. Are environment variables overriding your programmatic config?
4. Do your tests have `@EZTestProject` annotations that override the default?

### Multiple Projects Not Syncing

**Issue**: Tests with different projects not creating separate test runs

**Check:**
1. Are `@EZTestProject` annotations correctly placed?
2. Is the project ID in the annotation correct?
3. Do you have API access to all projects?
4. Check logs for "Created client for project" messages

## Summary

- **Default Project**: Set via `EZTestConfig` (programmatic), environment variables, or system properties
- **Priority**: Programmatic config > System properties > Environment variables
- **Override**: Use `@EZTestProject` annotation to override default for specific tests
- **Best Practice**: Set default programmatically for clarity and control

