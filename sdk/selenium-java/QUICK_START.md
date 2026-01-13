# Quick Start - Maven Installation

## Current Status
✅ Java 21 is installed  
❌ Maven is not installed

## Quick Fix: Install Maven

### Option 1: Using Chocolatey (Fastest)

If you have Chocolatey package manager:

```powershell
# Run PowerShell as Administrator
choco install maven
```

Then restart PowerShell and verify:
```powershell
mvn -version
```

### Option 2: Manual Installation (5 minutes)

1. **Download Maven**:
   - Visit: https://maven.apache.org/download.cgi
   - Download: `apache-maven-3.9.6-bin.zip` (or latest)

2. **Extract**:
   - Extract to: `C:\Program Files\Apache\maven`

3. **Add to PATH** (Run PowerShell as Administrator):
   ```powershell
   # Set MAVEN_HOME
   [Environment]::SetEnvironmentVariable("MAVEN_HOME", "C:\Program Files\Apache\maven", "Machine")
   
   # Add to PATH
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
   [Environment]::SetEnvironmentVariable("Path", "$currentPath;C:\Program Files\Apache\maven\bin", "Machine")
   ```

4. **Restart PowerShell** and test:
   ```powershell
   mvn -version
   ```

### Option 3: Use Maven Wrapper (No Installation Needed)

If the project has Maven Wrapper, you can use it without installing Maven globally.

Check if `mvnw.cmd` exists in the SDK directory:
```powershell
cd sdk\selenium-java
dir mvnw.cmd
```

If it exists, use:
```powershell
.\mvnw.cmd clean compile
.\mvnw.cmd test
.\mvnw.cmd package
```

## After Installing Maven

Once Maven is installed, you can build the SDK:

```powershell
cd sdk\selenium-java

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Build JAR
mvn clean package
```

## Alternative: Use IDE

If you prefer not to use command line:

1. **IntelliJ IDEA**:
   - Open `sdk/selenium-java` folder
   - IntelliJ will auto-detect Maven project
   - Right-click `pom.xml` → Maven → Download Sources and Documentation
   - Build: Build → Build Project

2. **Eclipse**:
   - File → Import → Maven → Existing Maven Projects
   - Select `sdk/selenium-java`
   - Right-click project → Run As → Maven build → Goals: `clean compile`

3. **VS Code**:
   - Install "Extension Pack for Java"
   - Open `sdk/selenium-java` folder
   - VS Code will auto-detect and download dependencies

## Verify Installation

After installing Maven, verify:

```powershell
mvn -version
```

You should see:
```
Apache Maven 3.9.x
Maven home: C:\Program Files\Apache\maven
Java version: 21.0.2
```

## Need Help?

See [SETUP.md](SETUP.md) for detailed setup instructions and troubleshooting.

