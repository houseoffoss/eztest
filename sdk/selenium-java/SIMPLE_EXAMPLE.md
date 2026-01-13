# Simple Example: Understanding Multiple Projects

## Scenario: You Have Project 1 in EZTest

Let's say you have **Project 1** (project ID: `proj_1`) in EZTest, and you want to sync your tests to it.

## Step 1: Set Default Project (Project 1)

### Option A: Using Environment Variable

```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_1  # Your Project 1
```

### Option B: Using Programmatic Config

```java
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "your-api-key",
    "proj_1"  // Your Project 1
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);
```

## Step 2: Use Project 1 (Default - No Annotation Needed)

```java
@Listeners(EZTestTestNGListener.class)
public class MyTests {
    @EZTestCase(title = "Test 1")
    @Test
    public void test1() {
        // This test will sync to Project 1 (proj_1)
        // Because it's the default project
    }
    
    @EZTestCase(title = "Test 2")
    @Test
    public void test2() {
        // This test will also sync to Project 1 (proj_1)
        // Because it's the default project
    }
}
```

**Result**: Both tests sync to **Project 1** ✅

## What "Override" Means (Simple Explanation)

"Override" does NOT mean:
- ❌ Replacing Project 1
- ❌ Removing Project 1
- ❌ Changing the default

"Override" means:
- ✅ For THIS specific test class/method, use a DIFFERENT project
- ✅ Other tests still use Project 1 (the default)
- ✅ Both projects can be used at the same time

## Example: Using Project 1 + Project 2 Together

### Setup: Default is Project 1

```bash
export EZTEST_PROJECT_ID=proj_1  # Default: Project 1
```

### Test Classes

```java
// Test Class 1: Uses DEFAULT (Project 1)
@Listeners(EZTestTestNGListener.class)
public class Project1Tests {
    @EZTestCase(title = "Test A")
    @Test
    public void testA() {
        // Syncs to → Project 1 (proj_1) ✅
    }
}

// Test Class 2: OVERRIDES to use Project 2
@EZTestProject(projectId = "proj_2")  // ← This "overrides" the default
@Listeners(EZTestTestNGListener.class)
public class Project2Tests {
    @EZTestCase(title = "Test B")
    @Test
    public void testB() {
        // Syncs to → Project 2 (proj_2) ✅
        // This "overrides" means: "For this class, use proj_2 instead of the default proj_1"
    }
}

// Test Class 3: Still uses DEFAULT (Project 1)
@Listeners(EZTestTestNGListener.class)
public class MoreProject1Tests {
    @EZTestCase(title = "Test C")
    @Test
    public void testC() {
        // Syncs to → Project 1 (proj_1) ✅
        // No override, so uses default
    }
}
```

### What Happens:

```
Test Execution:
│
├── Project1Tests (no annotation)
│   └── testA() → Project 1 ✅
│
├── Project2Tests (@EZTestProject(projectId = "proj_2"))
│   └── testB() → Project 2 ✅ (overrides default)
│
└── MoreProject1Tests (no annotation)
    └── testC() → Project 1 ✅
```

**Result**:
- `testA` and `testC` → Sync to **Project 1** (default)
- `testB` → Syncs to **Project 2** (overridden)

## Real-World Example

### Scenario: You Have 2 Projects

- **Project 1** (`proj_1`): Main application tests
- **Project 2** (`proj_2`): Mobile app tests

### Configuration

```bash
# Set Project 1 as default
export EZTEST_PROJECT_ID=proj_1
```

### Test Code

```java
// Most tests go to Project 1 (default)
@Listeners(EZTestTestNGListener.class)
public class WebAppTests {
    @EZTestCase(title = "Login Test")
    @Test
    public void testLogin() {
        // Syncs to Project 1 ✅
    }
    
    @EZTestCase(title = "Checkout Test")
    @Test
    public void testCheckout() {
        // Syncs to Project 1 ✅
    }
}

// Mobile tests go to Project 2 (override)
@EZTestProject(projectId = "proj_2")  // ← Override: Use Project 2
@Listeners(EZTestTestNGListener.class)
public class MobileAppTests {
    @EZTestCase(title = "Mobile Login")
    @Test
    public void testMobileLogin() {
        // Syncs to Project 2 ✅ (overridden)
    }
}
```

## Key Points

1. **Default Project**: Set via `EZTEST_PROJECT_ID` or `EZTestConfig`
   - All tests without `@EZTestProject` use this default

2. **Override**: Use `@EZTestProject(projectId = "proj_2")` 
   - Only affects that specific test class/method
   - Other tests still use the default
   - Both projects are used simultaneously

3. **No Override = Use Default**: If you don't use `@EZTestProject`, tests use the default project

## If You Only Have Project 1

If you only have **Project 1** and want ALL tests to sync to it:

```bash
# Set Project 1 as default
export EZTEST_PROJECT_ID=proj_1
```

```java
// All tests use Project 1 (no override needed)
@Listeners(EZTestTestNGListener.class)
public class AllTests {
    @EZTestCase(title = "Test 1")
    @Test
    public void test1() {
        // Syncs to Project 1 ✅
    }
    
    @EZTestCase(title = "Test 2")
    @Test
    public void test2() {
        // Syncs to Project 1 ✅
    }
}
```

**No `@EZTestProject` annotation needed** - all tests automatically use Project 1!

## Summary

- **Default Project**: Set once, used by all tests without annotation
- **Override**: Use `@EZTestProject` to send specific tests to a different project
- **Both Work Together**: Default and overridden projects can be used in the same test run
- **If Only One Project**: Just set it as default, no override needed

