# SDK Setup Guide

This guide helps you set up the development environment for the EZTest Selenium Java SDK.

## Prerequisites

- **Java 11 or higher** - Required for building and running the SDK
- **Maven 3.6+** - Required for building the SDK
- **IDE** (optional) - IntelliJ IDEA, Eclipse, or VS Code

## Installing Maven on Windows

### Option 1: Using Chocolatey (Recommended)

If you have Chocolatey installed:

```powershell
choco install maven
```

### Option 2: Manual Installation

1. **Download Maven**:
   - Go to https://maven.apache.org/download.cgi
   - Download `apache-maven-3.9.x-bin.zip` (latest version)

2. **Extract Maven**:
   - Extract to `C:\Program Files\Apache\maven` (or your preferred location)

3. **Add to PATH**:
   ```powershell
   # Open PowerShell as Administrator
   [Environment]::SetEnvironmentVariable("MAVEN_HOME", "C:\Program Files\Apache\maven", "Machine")
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Apache\maven\bin", "Machine")
   ```

4. **Restart PowerShell** and verify:
   ```powershell
   mvn -version
   ```

### Option 3: Using SDKMAN (if using WSL/Git Bash)

```bash
sdk install maven
```

## Verify Installation

After installing Maven, verify it works:

```powershell
# Check Maven version
mvn -version

# Check Java version
java -version
```

Expected output:
```
Apache Maven 3.9.x
Maven home: C:\Program Files\Apache\maven
Java version: 11.x.x or higher
```

## Building the SDK

Once Maven is installed:

```powershell
# Navigate to SDK directory
cd sdk\selenium-java

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Build JAR file
mvn clean package

# Install to local Maven repository
mvn clean install
```

## Troubleshooting

### Maven Not Found

**Error**: `mvn : The term 'mvn' is not recognized`

**Solutions**:
1. Verify Maven is installed: Check if `mvn.bat` exists in your Maven bin directory
2. Check PATH: Run `$env:Path` and verify Maven bin directory is included
3. Restart PowerShell: Close and reopen PowerShell after adding to PATH
4. Use full path: `C:\Program Files\Apache\maven\bin\mvn.cmd clean compile`

### Java Not Found

**Error**: `java : The term 'java' is not recognized`

**Solutions**:
1. Install Java JDK 11 or higher from https://adoptium.net/
2. Add Java to PATH:
   ```powershell
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-11", "Machine")
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Java\jdk-11\bin", "Machine")
   ```

### Build Errors

**Error**: Dependency download failures

**Solutions**:
1. Check internet connection
2. Clear Maven cache: `mvn dependency:purge-local-repository`
3. Use offline mode if needed: `mvn -o clean compile`

## Alternative: Using Maven Wrapper

If Maven is not installed, you can use the Maven Wrapper (if available):

```powershell
# On Windows
.\mvnw.cmd clean compile

# Or if using Git Bash/WSL
./mvnw clean compile
```

## IDE Setup

### IntelliJ IDEA

1. Open `sdk/selenium-java` folder
2. IntelliJ will detect `pom.xml` and import as Maven project
3. Wait for dependencies to download
4. Right-click `pom.xml` → Maven → Reload Project

### Eclipse

1. File → Import → Maven → Existing Maven Projects
2. Select `sdk/selenium-java` folder
3. Click Finish
4. Wait for dependencies to download

### VS Code

1. Install "Extension Pack for Java" extension
2. Open `sdk/selenium-java` folder
3. VS Code will detect Maven project automatically
4. Wait for dependencies to download

## Quick Start (Without Maven)

If you just want to use the SDK (not build it), you can:

1. **Download pre-built JAR** (when available)
2. **Add to your project**:
   ```xml
   <dependency>
       <groupId>com.eztest</groupId>
       <artifactId>eztest-selenium-java-sdk</artifactId>
       <version>1.0.0</version>
   </dependency>
   ```

## Next Steps

Once Maven is installed:

1. Build the SDK: `mvn clean package`
2. Run tests: `mvn test`
3. See [USAGE_GUIDE.md](USAGE_GUIDE.md) for usage examples
4. See [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing instructions

