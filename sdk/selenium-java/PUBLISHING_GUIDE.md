# Publishing EZTest SDK to GitHub Packages

This guide explains how to publish the EZTest SDK to GitHub Packages and how clients can use it.

## Option 1: GitHub Packages (Recommended)

### Step 1: Configure GitHub Packages in `pom.xml`

Update your `pom.xml` to include GitHub Packages distribution:

```xml
<distributionManagement>
   <repository>
     <id>github</id>
     <name>GitHub Packages</name>
     <url>https://maven.pkg.github.com/YOUR_USERNAME/YOUR_REPO_NAME</url>
   </repository>
</distributionManagement>
```

Replace:
- `YOUR_USERNAME` - Your GitHub username or organization
- `YOUR_REPO_NAME` - Your repository name (e.g., `eztest-selenium-java-sdk`)

### Step 2: Configure Maven Settings

Add GitHub authentication to `~/.m2/settings.xml`:

```xml
<settings>
  <servers>
    <server>
      <id>github</id>
      <username>YOUR_GITHUB_USERNAME</username>
      <password>YOUR_GITHUB_TOKEN</password>
    </server>
  </servers>
</settings>
```

**To create a GitHub token:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `write:packages` and `read:packages` permissions
3. Use this token as the password in `settings.xml`

### Step 3: Build and Publish

```bash
cd sdk/selenium-java
mvn clean deploy
```

The package will be published to: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/packages`

---

## Option 2: Maven Central (For Public Distribution)

### Prerequisites
1. Create account at https://issues.sonatype.org/
2. Create a JIRA ticket to request groupId approval
3. Set up GPG signing

### Configure `pom.xml`

Uncomment and update the `distributionManagement` section in `pom.xml`:

```xml
<distributionManagement>
    <snapshotRepository>
        <id>ossrh</id>
        <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
    </snapshotRepository>
    <repository>
        <id>ossrh</id>
        <url>https://s01.oss.sonatype.org/service/local/staging/deploy/maven2</url>
    </repository>
</distributionManagement>
```

### Publish

```bash
mvn clean deploy
```

---

## Option 3: Local JAR Distribution

### Build JAR

```bash
cd sdk/selenium-java
mvn clean package
```

This creates: `target/eztest-selenium-java-sdk-1.0.0.jar`

### Distribute to Clients

Share the JAR file and have clients install it locally:

```bash
mvn install:install-file \
  -Dfile=eztest-selenium-java-sdk-1.0.0.jar \
  -DgroupId=com.eztest \
  -DartifactId=eztest-selenium-java-sdk \
  -Dversion=1.0.0 \
  -Dpackaging=jar
```

---

## How Clients Can Use the SDK

### Method 1: GitHub Packages (After Publishing)

#### Step 1: Add GitHub Packages Repository

In client's `pom.xml`:

```xml
<repositories>
  <repository>
    <id>github</id>
    <url>https://maven.pkg.github.com/YOUR_USERNAME/YOUR_REPO_NAME</url>
  </repository>
</repositories>
```

#### Step 2: Add Authentication

In client's `~/.m2/settings.xml`:

```xml
<settings>
  <servers>
    <server>
      <id>github</id>
      <username>CLIENT_GITHUB_USERNAME</username>
      <password>CLIENT_GITHUB_TOKEN</password>
    </server>
  </servers>
</settings>
```

**Note:** Client needs a GitHub token with `read:packages` permission.

#### Step 3: Add Dependency

In client's `pom.xml`:

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

### Method 2: Maven Central (After Publishing)

Simply add dependency (no repository configuration needed):

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

### Method 3: Local JAR

#### Option A: Install Locally

```bash
mvn install:install-file \
  -Dfile=eztest-selenium-java-sdk-1.0.0.jar \
  -DgroupId=com.eztest \
  -DartifactId=eztest-selenium-java-sdk \
  -Dversion=1.0.0 \
  -Dpackaging=jar
```

Then add dependency:

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

#### Option B: System Scope

```xml
<dependency>
    <groupId>com.eztest</groupId>
    <artifactId>eztest-selenium-java-sdk</artifactId>
    <version>1.0.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/eztest-selenium-java-sdk-1.0.0.jar</systemPath>
</dependency>
```

---

## Quick Start for Clients

After adding the dependency, clients can use the SDK:

```java
import com.eztest.sdk.core.EZTestConfig;
import com.eztest.sdk.core.EZTestClient;
import com.eztest.sdk.core.EZTestReportImporter;

// Configure
EZTestConfig config = new EZTestConfig(
    "https://your-eztest-server.com",
    "your-api-key",
    "your-project-id"
);

// Use
EZTestClient client = new EZTestClient(config);
EZTestReportImporter importer = new EZTestReportImporter(client);

// Import report
String testRunId = importer.importFromFile("report.json");
```

---

## Version Management

### Updating Version

Update version in `pom.xml`:

```xml
<version>1.0.1</version>
```

Then publish:

```bash
mvn clean deploy
```

### Semantic Versioning

- `MAJOR.MINOR.PATCH`
- `1.0.0` → `1.0.1` (patch - bug fixes)
- `1.0.0` → `1.1.0` (minor - new features)
- `1.0.0` → `2.0.0` (major - breaking changes)

---

## Troubleshooting

### Authentication Issues

- Verify GitHub token has correct permissions
- Check `settings.xml` server configuration
- Ensure token hasn't expired

### Repository Not Found

- Verify repository URL is correct
- Check repository is public or client has access
- Ensure package visibility settings allow access

### Dependency Resolution

- Clear Maven cache: `mvn dependency:purge-local-repository`
- Update Maven: `mvn -U clean install`
- Check internet connectivity

---

## Recommended Approach

**For Internal/Private Use:**
- Use GitHub Packages (Option 1)
- Easy to manage access
- Integrated with GitHub

**For Public Distribution:**
- Use Maven Central (Option 2)
- No authentication needed
- Standard Maven repository

**For Quick Testing:**
- Use Local JAR (Option 3)
- No publishing required
- Fast for development

