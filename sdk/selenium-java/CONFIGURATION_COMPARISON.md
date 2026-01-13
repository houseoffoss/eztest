# Configuration Methods Comparison

This guide compares different configuration methods and clarifies when environment variables are needed.

## Quick Answer

**If you use `EZTestConfig` programmatically:**
- ❌ **You DON'T need environment variables**
- ✅ All values come from the `EZTestConfig` object
- ✅ Programmatic config **overrides** environment variables

**If you DON'T use programmatic config:**
- ✅ **You NEED environment variables** (or system properties)
- ✅ SDK reads from environment variables automatically

## Configuration Methods

### Method 1: Programmatic Configuration (No Environment Variables Needed)

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.listeners.EZTestTestNGListener;

// All configuration in code - NO environment variables needed
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",  // Server URL
    "your-api-key",                 // API Key
    "proj_main"                     // Project ID
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// Even if EZTEST_PROJECT_ID is set in environment, it will be IGNORED
// The project ID "proj_main" from config will be used
```

**Characteristics:**
- ✅ No environment variables needed
- ✅ All values explicit in code
- ✅ Overrides environment variables
- ✅ Can load from config files, databases, etc.

### Method 2: Environment Variables (No Programmatic Config)

```bash
# Set environment variables
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_main
```

```java
// No programmatic config - SDK reads from environment variables
@Listeners(EZTestTestNGListener.class)
public class Tests {
    @EZTestCase(title = "Test")
    @Test
    public void test() {
        // Uses proj_main from EZTEST_PROJECT_ID env var
    }
}
```

**Characteristics:**
- ✅ Environment variables required
- ✅ No code changes needed
- ✅ Good for CI/CD pipelines
- ✅ Can be overridden by programmatic config

### Method 3: Mixed (Programmatic Config Overrides Env Vars)

```bash
# Set environment variables (as fallback)
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_env_default
```

```java
// Programmatic config - overrides environment variables
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_programmatic"  // This overrides EZTEST_PROJECT_ID env var
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// Uses proj_programmatic (from config), NOT proj_env_default (from env var)
```

**Characteristics:**
- ⚠️ Environment variables are set but **ignored**
- ✅ Programmatic config takes priority
- ✅ Useful when you want to override defaults

## Priority Order

1. **Programmatic Config** (`EZTestConfig` via `initialize()`) - **Highest Priority**
   - If provided, environment variables are **ignored**
   - All values come from the config object
2. **System Properties** (`-Deztest.project.id=...`)
   - Used if no programmatic config
3. **Environment Variables** (`EZTEST_PROJECT_ID`)
   - Used if no programmatic config or system properties

## Decision Matrix

| Scenario | Need Env Vars? | Why |
|----------|----------------|-----|
| Using `EZTestConfig` programmatically | ❌ **NO** | Config provides all values |
| Not using programmatic config | ✅ **YES** | SDK needs values from somewhere |
| Want to override env vars | ❌ **NO** | Programmatic config overrides |
| CI/CD with env vars | ✅ **YES** | Set in pipeline, no code changes |

## Examples

### Example 1: Programmatic Only (No Env Vars)

```java
// No environment variables needed
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "api-key-123",
    "proj_main"
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);
```

### Example 2: Environment Variables Only (No Programmatic Config)

```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=api-key-123
export EZTEST_PROJECT_ID=proj_main
```

```java
// No programmatic config - uses environment variables
@Listeners(EZTestTestNGListener.class)
public class Tests {
    // Uses proj_main from EZTEST_PROJECT_ID
}
```

### Example 3: Programmatic Overrides Env Vars

```bash
# These are set but will be ignored
export EZTEST_PROJECT_ID=proj_env
```

```java
// Programmatic config overrides environment variables
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "api-key-123",
    "proj_config"  // This is used, NOT proj_env from env var
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);
```

## Best Practices

1. **Choose One Method**: Either use programmatic config OR environment variables, not both
2. **Programmatic for Applications**: Use `EZTestConfig` when you have control over the code
3. **Environment Variables for CI/CD**: Use env vars when you want to configure without code changes
4. **Document Your Choice**: Make it clear which method your project uses

## Summary

| Question | Answer |
|----------|--------|
| If I use `EZTestConfig(projectId)`, do I need env vars? | ❌ **NO** - Config provides all values |
| If I don't use programmatic config, do I need env vars? | ✅ **YES** - SDK needs values from somewhere |
| Can I use both? | ⚠️ **Yes, but config overrides env vars** |
| Which takes priority? | **Programmatic config > System properties > Environment variables** |

