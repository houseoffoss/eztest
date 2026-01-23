# TestNG XML Integration - Quick Reference Card

## 1-Minute Setup

### Files to Add (2 required)
```
src/test/java/utils/
├── EZTestCreateTestRunUploader.java
└── EZTestCreateTestRunUploaderMain.java
```

### Dependencies (1 required)
```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
    <scope>test</scope>
</dependency>
```

### Plugins (2 required)
```xml
<!-- maven-surefire-plugin: Runs TestNG tests -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.2.5</version>
  <configuration>
    <testFailureIgnore>true</testFailureIgnore>
  </configuration>
</plugin>

<!-- exec-maven-plugin: Uploads results -->
<plugin>
  <groupId>org.codehaus.mojo</groupId>
  <artifactId>exec-maven-plugin</artifactId>
  <version>3.1.0</version>
  <executions>
    <execution>
      <phase>verify</phase>
      <goals><goal>java</goal></goals>
      <configuration>
        <mainClass>utils.EZTestCreateTestRunUploaderMain</mainClass>
        <arguments>
          <argument>target/failsafe-reports/testng-results.xml</argument>
        </arguments>
      </configuration>
    </execution>
  </executions>
</plugin>
```

### Environment Configuration
```env
# .env file (in project root, add to .gitignore)
EZTEST_BASE_URL=https://api.eztest.io
EZTEST_API_TOKEN=your_secret_api_token
EZTEST_PROJECT_ID=your_project_unique_id
EZTEST_ENVIRONMENT=QA_Staging
```

### Test Case Naming
```java
// ✅ Correct
@Test
public void TC_1() { }

@Test
public void TC_LOGIN_001() { }

// ❌ Wrong
@Test
public void loginTest() { }
```

---

## Run Tests

```bash
# Recommended way (cleans, tests, verifies, uploads)
mvn clean verify

# Alternative (tests and uploads)
mvn test
```

### What Happens
1. Tests execute
2. XML generated → `target/failsafe-reports/testng-results.xml`
3. Upload triggered → EZTest API
4. Test Run created in EZTest dashboard
5. Test case results updated (PASS/FAIL/SKIPPED)

---

## Troubleshooting

| Error | Cause | Solution |
|---|---|---|
| 401 Unauthorized | Invalid token or project | Regenerate token in EZTest |
| File not found | Tests didn't run | Check `mvn test` output |
| No matching items | Test names don't match | Use `TC_1` format, match EZTest IDs |
| Connection refused | Server unreachable | Verify base URL and firewall |
| Missing env var | `.env` not in root | Create `.env` in project root |

---

## Key Points

✅ **DO:**
- Use underscores in method names: `TC_1()`
- Keep `.env` in `.gitignore`
- Use HTTPS in production
- Run `mvn clean verify`
- Match test IDs to EZTest

❌ **DON'T:**
- Add `/api` to base URL
- Use quotes in `.env` values
- Add trailing spaces in `.env`
- Hardcode credentials
- Commit `.env` to git

---

## Directory Structure

```
your-project/
├── src/test/java/utils/
│   ├── EZTestCreateTestRunUploader.java
│   └── EZTestCreateTestRunUploaderMain.java
├── pom.xml                    (configured)
├── .env                       (gitignored)
├── testng.xml                 (existing)
├── target/
│   └── failsafe-reports/
│       └── testng-results.xml (auto-generated)
└── .gitignore                 (includes .env)
```

---

## API Endpoint

```
POST /api/projects/{projectId}/testruns/import-xml
?environment={env}&filename={filename}

Headers:
  Authorization: Bearer {token}
  Content-Type: application/xml

Success: 200 OK
Failure: 400, 401, 403, 500
```

---

## Common Commands

```bash
# Run tests with upload
mvn clean verify

# Run only tests
mvn test

# Clean before running
mvn clean

# Debug: Show plugin execution
mvn clean verify -X

# Test XML file exists
ls -la target/failsafe-reports/testng-results.xml

# Test API connection manually
curl -X POST \
  "https://your-eztest-domain.com/api/projects/YOUR_ID/testruns/import-xml?environment=STAGING&filename=test.xml" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/xml" \
  --data-binary "@target/failsafe-reports/testng-results.xml"
```

---

## Test Case Mapping Examples

| Method Name | EZTest ID | Status |
|---|---|---|
| `TC_1()` | `TC-1` | ✅ Works |
| `TC_LOGIN_001()` | `TC-LOGIN-001` | ✅ Works |
| `TC_SIGNUP()` | `TC-SIGNUP` | ✅ Works |
| `loginTest()` | (not mapped) | ❌ Fails |
| `TEST_1()` | `TEST-1` | ✅ Works |

---

## Environment Values

```env
# Example: Local Development
EZTEST_BASE_URL=http://localhost:3000
EZTEST_API_TOKEN=dev_token_12345
EZTEST_PROJECT_ID=proj_dev_001
EZTEST_ENVIRONMENT=Development

# Example: QA Environment
EZTEST_BASE_URL=https://qa.eztest.com
EZTEST_API_TOKEN=qa_token_67890
EZTEST_PROJECT_ID=proj_qa_002
EZTEST_ENVIRONMENT=QA_Staging

# Example: Production
EZTEST_BASE_URL=https://api.eztest.io
EZTEST_API_TOKEN=prod_token_xxxxx
EZTEST_PROJECT_ID=proj_prod_001
EZTEST_ENVIRONMENT=Production
```

---

## Success Checklist

- [ ] 2 Java files added to `src/test/java/utils/`
- [ ] Dependency added to `pom.xml`
- [ ] Maven plugins configured in `pom.xml`
- [ ] `.env` file created in project root
- [ ] `.env` added to `.gitignore`
- [ ] Test cases created in EZTest
- [ ] Test method names match EZTest IDs
- [ ] `mvn clean verify` runs successfully
- [ ] "✅ EZTest results uploaded successfully" appears
- [ ] Test Run visible in EZTest dashboard

---

**Reference Card Version:** 1.0  
**Last Updated:** 2026-01-23  
**For Full Details:** See `testng-maven-integration.md`

