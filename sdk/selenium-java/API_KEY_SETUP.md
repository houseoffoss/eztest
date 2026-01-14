# Where to Set API Key

This guide shows all the places where you can set your EZTest API key. 

**Note:** API keys are created in EZTest and provide secure authentication for SDK access. You can create API keys via the EZTest web interface or API.

## Method 1: Environment Variable (Recommended for CI/CD)

### Windows (PowerShell)

```powershell
$env:EZTEST_API_KEY = "your-api-key-here"
```

### Windows (Command Prompt)

```cmd
set EZTEST_API_KEY=your-api-key-here
```

### Linux/Mac (Bash)

```bash
export EZTEST_API_KEY=your-api-key-here
```

### Permanent Setup (Windows)

1. Right-click "This PC" → Properties
2. Advanced system settings → Environment Variables
3. Under "User variables" or "System variables", click "New"
4. Variable name: `EZTEST_API_KEY`
5. Variable value: `your-api-key-here`
6. Click OK

### Permanent Setup (Linux/Mac)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
echo 'export EZTEST_API_KEY=your-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

## Method 2: System Property (Java Command Line)

```bash
java -Deztest.api.key=your-api-key-here YourTestClass
```

### With Maven

```bash
mvn test -Deztest.api.key=your-api-key-here
```

### In Maven pom.xml

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <systemPropertyVariables>
            <eztest.api.key>your-api-key-here</eztest.api.key>
        </systemPropertyVariables>
    </configuration>
</plugin>
```

## Method 3: Programmatic Configuration (In Code)

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.listeners.EZTestTestNGListener;

// Set API key directly in code
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",  // Server URL
    "your-api-key-here",            // API Key ← Set here
    "proj_1"                        // Project ID
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);
```

### Loading from Config File

```java
import java.util.Properties;
import java.io.FileInputStream;

// Load from properties file
Properties props = new Properties();
props.load(new FileInputStream("config.properties"));

String apiKey = props.getProperty("eztest.api.key");

EZTestConfig config = new EZTestConfig(
    props.getProperty("eztest.server.url"),
    apiKey,  // API key from config file
    props.getProperty("eztest.project.id")
);
```

## Method 4: Per-Project API Key (Using @EZTestProject)

If different projects need different API keys:

```java
import com.eztest.sdk.annotations.EZTestProject;

// Default API key from environment/config
@Listeners(EZTestTestNGListener.class)
public class DefaultTests {
    // Uses default API key
}

// Override API key for specific project
@EZTestProject(
    projectId = "proj_external",
    apiKey = "different-api-key-here"  // ← Different API key
)
@Listeners(EZTestTestNGListener.class)
public class ExternalProjectTests {
    // Uses different API key for this project
}
```

## Priority Order

The SDK checks API key in this order:

1. **@EZTestProject annotation** (if specified on test class/method) - **Highest Priority**
2. **Programmatic Config** (`EZTestConfig` via `initialize()`)
3. **System Property** (`-Deztest.api.key=...`)
4. **Environment Variable** (`EZTEST_API_KEY`)

## Complete Example: All Methods Together

```bash
# Method 1: Environment Variable (fallback)
export EZTEST_API_KEY=default-api-key
```

```java
// Method 2: Programmatic Config (overrides env var)
EZTestConfig config = new EZTestConfig(
    "https://eztest.example.com",
    "programmatic-api-key",  // ← This overrides env var
    "proj_1"
);

EZTestTestNGListener listener = new EZTestTestNGListener();
listener.initialize(config);

// Method 3: Per-project override
@EZTestProject(
    projectId = "proj_2",
    apiKey = "project2-api-key"  // ← This overrides programmatic config
)
@Listeners(EZTestTestNGListener.class)
public class Project2Tests {
    // Uses project2-api-key
}
```

## Security Best Practices

### ✅ DO:

1. **Use Environment Variables in CI/CD**:
   ```yaml
   # GitHub Actions
   env:
     EZTEST_API_KEY: ${{ secrets.EZTEST_API_KEY }}
   ```

2. **Use Secrets Management**:
   - Store API keys in secret stores (GitHub Secrets, Jenkins Credentials, etc.)
   - Never commit API keys to version control

3. **Use Different Keys per Environment**:
   - Dev API key for development
   - Prod API key for production

### ❌ DON'T:

1. **Don't Hardcode**:
   ```java
   // ❌ BAD
   EZTestConfig config = new EZTestConfig(
       "https://eztest.example.com",
       "hardcoded-key-12345",  // Never do this!
       "proj_1"
   );
   ```

2. **Don't Commit Secrets**:
   - Never commit `.env` files with real API keys
   - Use `.env.example` with placeholder values

3. **Don't Log API Keys**:
   - SDK automatically avoids logging sensitive data
   - Be careful in your own code

## Verification

To verify your API key is set correctly:

**Windows (PowerShell):**
```powershell
echo $env:EZTEST_API_KEY
```

**Linux/Mac:**
```bash
echo $EZTEST_API_KEY
```

**Java Test:**
```java
String apiKey = System.getenv("EZTEST_API_KEY");
System.out.println("API Key: " + (apiKey != null ? "***SET***" : "NOT SET"));
```

## Troubleshooting

### API Key Not Found

**Issue**: SDK says API key not found

**Solution**:
1. Verify variable name: `EZTEST_API_KEY` (case-sensitive on Linux/Mac)
2. Restart your IDE/terminal after setting
3. Check if programmatic config is overriding it
4. Use `echo $EZTEST_API_KEY` to verify

### API Key Not Working

**Issue**: 401 Unauthorized errors

**Solution**:
1. Verify API key is correct (check for typos)
2. Check API key is active and not deleted
3. Verify API key hasn't expired (if expiration was set)
4. Ensure API key has required permissions (`testcases:create`, `testruns:create`, etc.)
5. Verify server URL is correct
6. Check if API key is scoped to a specific project (if so, ensure project ID matches)

## Summary

| Method | When to Use | Priority |
|--------|-------------|----------|
| **@EZTestProject annotation** | Different API key per project | Highest |
| **Programmatic Config** | Application code, config files | High |
| **System Property** | Command line, Maven | Medium |
| **Environment Variable** | CI/CD, system-wide | Lowest (but still works!) |

**Recommended**: Use environment variables for CI/CD, programmatic config for applications.

