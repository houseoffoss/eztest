# Quick Examples - Choosing Projects

Quick reference for choosing specific projects when using environment variables.

## Scenario: Environment Variable Default + Specific Projects

### Setup Environment Variables

```bash
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=your-api-key
export EZTEST_PROJECT_ID=proj_main  # Default project
```

### Use Default Project (No Annotation Needed)

```java
@Listeners(EZTestTestNGListener.class)
public class MainTests {
    @EZTestCase(title = "Main Test")
    @Test
    public void testMain() {
        // Uses proj_main (from EZTEST_PROJECT_ID env var)
    }
}
```

### Override to Use Different Project

**Option 1: Class-Level Override**
```java
@EZTestProject(projectId = "proj_frontend")
@Listeners(EZTestTestNGListener.class)
public class FrontendTests {
    @EZTestCase(title = "UI Test")
    @Test
    public void testUI() {
        // Uses proj_frontend (overrides env var default)
    }
}
```

**Option 2: Method-Level Override**
```java
@Listeners(EZTestTestNGListener.class)
public class MixedTests {
    @EZTestCase(title = "Default Test")
    @Test
    public void testDefault() {
        // Uses proj_main (from env var)
    }
    
    @EZTestProject(projectId = "proj_backend")
    @EZTestCase(title = "Backend Test")
    @Test
    public void testBackend() {
        // Uses proj_backend (overrides env var)
    }
}
```

## Complete Example

```bash
# Environment variables
export EZTEST_SERVER_URL=https://eztest.example.com
export EZTEST_API_KEY=api-key-123
export EZTEST_PROJECT_ID=proj_default
```

```java
import com.eztest.sdk.annotations.EZTestCase;
import com.eztest.sdk.annotations.EZTestProject;
import com.eztest.sdk.listeners.EZTestTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

// Uses default project (proj_default from env var)
@Listeners(EZTestTestNGListener.class)
public class DefaultProjectTests {
    @EZTestCase(title = "Test 1")
    @Test
    public void test1() {
        // Syncs to proj_default
    }
}

// Override to use different project
@EZTestProject(projectId = "proj_frontend")
@Listeners(EZTestTestNGListener.class)
public class FrontendTests {
    @EZTestCase(title = "UI Test")
    @Test
    public void testUI() {
        // Syncs to proj_frontend
    }
}

@EZTestProject(projectId = "proj_backend")
@Listeners(EZTestTestNGListener.class)
public class BackendTests {
    @EZTestCase(title = "API Test")
    @Test
    public void testAPI() {
        // Syncs to proj_backend
    }
}
```

## Key Points

✅ **Default Project**: Set via `EZTEST_PROJECT_ID` environment variable  
✅ **Override Default**: Use `@EZTestProject(projectId = "proj_name")` annotation  
✅ **Priority**: Annotation overrides environment variable  
✅ **Flexibility**: Can override at class level or method level  

## See Also

- [MULTIPLE_PROJECTS.md](MULTIPLE_PROJECTS.md) - Complete guide on multiple projects
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - All environment variables
- [USAGE_GUIDE.md](USAGE_GUIDE.md) - Detailed usage examples

