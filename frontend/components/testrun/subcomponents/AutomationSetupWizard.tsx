'use client';

import { useState } from 'react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { ChevronLeft, ChevronRight, CheckCircle2, Copy, FileCode, Code, Settings, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/frontend/reusable-elements/alerts/Alert';

interface AutomationSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectKey?: string;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

export function AutomationSetupWizard({
  open,
  onOpenChange,
  projectId,
  projectKey = 'PROJ',
}: AutomationSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const CodeBlock = ({ code, id, language = 'bash' }: { code: string; id: string; language?: string }) => (
    <div className="relative group">
      <pre className="bg-[#0a0e1a] border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-white/90">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
        title="Copy to clipboard"
      >
        {copiedCode === id ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-white/70" />
        )}
      </button>
    </div>
  );

  const steps: WizardStep[] = [
    {
      id: 0,
      title: 'Prerequisites',
      description: 'Ensure you have the required tools and access',
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Before starting, make sure you have the following prerequisites:
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Java 8 or higher</p>
                <p className="text-sm text-white/60 mt-1">Required for running TestNG tests</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Maven 3.6+</p>
                <p className="text-sm text-white/60 mt-1">Build tool for your automation project</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">TestNG-based automation project</p>
                <p className="text-sm text-white/60 mt-1">Maven-based project with TestNG framework</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">EZTest API Token</p>
                <p className="text-sm text-white/60 mt-1">Generate from EZTest settings → API Keys</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Project ID</p>
                <p className="text-sm text-white/60 mt-1">Your EZTest project ID: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{projectId}</code></p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Step 1: Add Java Files',
      description: 'Add the required utility files to your project',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Add exactly <strong className="text-white/90">2 Java files</strong> to your project under:
          </p>
          <CodeBlock code="src/test/java/utils/" id="folder-path" />
          
          <div className="space-y-6 mt-6">
            <div>
              <h4 className="font-medium text-white/90 mb-2 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                File 1: EZTestCreateTestRunUploader.java
              </h4>
              <p className="text-sm text-white/60 mb-2">
                Location: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">src/test/java/utils/EZTestCreateTestRunUploader.java</code>
              </p>
              <p className="text-xs text-white/50 mb-3">
                This file handles API connection, authentication, and binary upload of XML files.
              </p>
              <CodeBlock
                code={`package utils;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Utility class to upload TestNG XML result files to the EZTest reporting API.
 * This class handles environment configuration, URL construction, and 
 * authenticated multipart-style binary uploads.
 */
public class EZTestCreateTestRunUploader {
    private final String baseUrl;
    private final String token;
    private final String projectId;
    private final String environment;

    /**
     * Initializes the uploader by loading required credentials and 
     * configurations from the project's .env file.
     * 
     * @throws IllegalStateException if any required environment variable is missing.
     */
    public EZTestCreateTestRunUploader() {
        // Load .env file from the project root
        Dotenv dotenv = Dotenv.load();
        this.baseUrl = normalizeBaseUrl(
                getRequiredEnv(dotenv, "EZTEST_BASE_URL")
        );
        this.token = getRequiredEnv(dotenv, "EZTEST_API_TOKEN");
        this.projectId = getRequiredEnv(dotenv, "EZTEST_PROJECT_ID");
        this.environment = getRequiredEnv(dotenv, "EZTEST_ENVIRONMENT");
    }

    /**
     * Reads a TestNG XML file from the local disk and uploads it to the EZTest API.
     * 
     * @param xmlPath The relative or absolute path to the XML results file 
     *                (e.g., "target/failsafe-reports/testng-results.xml").
     * @throws FileNotFoundException If the file at xmlPath does not exist.
     * @throws Exception For networking errors or non-2xx API responses.
     */
    public void upload(String xmlPath) throws Exception {
        Path path = Path.of(xmlPath);
        
        // Validate file existence before starting connection
        if (!Files.exists(path)) {
            throw new FileNotFoundException(
                    "TestNG results file not found at: " + xmlPath
            );
        }

        byte[] xmlBytes = Files.readAllBytes(path);
        String filename = path.getFileName().toString();

        // Construct the API endpoint with encoded query parameters
        String urlStr = baseUrl
                + "/api/projects/"
                + URLEncoder.encode(projectId, StandardCharsets.UTF_8)
                + "/testruns/import-xml"
                + "?environment=" + URLEncoder.encode(environment, StandardCharsets.UTF_8)
                + "&filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8);

        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();

        // Configure Request Headers
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/xml");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);

        // Stream the XML file content to the request body
        try (OutputStream os = conn.getOutputStream()) {
            os.write(xmlBytes);
        }

        int status = conn.getResponseCode();
        System.out.println("EZTest upload status: " + status);

        // Handle Success
        if (status >= 200 && status < 300) {
            System.out.println("✅ EZTest results uploaded successfully");
            return;
        }

        // Handle Failure: Attempt to read the error message from the server
        String errorBody = "";
        try (InputStream err = conn.getErrorStream()) {
            if (err != null) {
                errorBody = new String(err.readAllBytes(), StandardCharsets.UTF_8);
            }
        }

        System.err.println("❌ EZTest upload failed");
        if (!errorBody.isBlank()) {
            System.err.println("Response body from server: " + errorBody);
        }

        throw new RuntimeException(
                "EZTest upload failed with HTTP status " + status
        );
    }

    // ----------------- Private Helpers -----------------

    /**
     * Validates and retrieves a variable from the .env file.
     */
    private static String getRequiredEnv(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Configuration Error: Missing required environment variable '" + key 
                    + "' in .env file."
            );
        }
        return value;
    }

    /**
     * Removes trailing slashes from the base URL to prevent double-slash errors 
     * in path construction.
     */
    private static String normalizeBaseUrl(String url) {
        return url.endsWith("/")
                ? url.substring(0, url.length() - 1)
                : url;
    }
}`}
                id="file1-content"
                language="java"
              />
            </div>

            <div>
              <h4 className="font-medium text-white/90 mb-2 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                File 2: EZTestCreateTestRunUploaderMain.java
              </h4>
              <p className="text-sm text-white/60 mb-2">
                Location: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">src/test/java/utils/EZTestCreateTestRunUploaderMain.java</code>
              </p>
              <p className="text-xs text-white/50 mb-3">
                Main class used by Maven exec-plugin to trigger the upload process.
              </p>
              <CodeBlock
                code={`package utils;

public class EZTestCreateTestRunUploaderMain {
    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            throw new IllegalArgumentException(
                "Missing path to testng-results.xml"
            );
        }

        String xmlPath = args[0];

        new EZTestCreateTestRunUploader()
                .upload(xmlPath);
    }
}`}
                id="file2-content"
                language="java"
              />
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> You may change the package name (e.g., <code className="bg-white/10 px-1 py-0.5 rounded">com.example.utils</code>), 
              but it must match in both Java files and in the <code className="bg-white/10 px-1 py-0.5 rounded">pom.xml</code> configuration.
            </AlertDescription>
          </Alert>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60">
              <strong className="text-white/80">📚 Full Documentation:</strong>{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded">docs/integrations/testng-maven-integration.md</code>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Step 2: Add Dependencies',
      description: 'Add required Maven dependencies to your pom.xml',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Add the following dependency to your <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">pom.xml</code>:
          </p>
          <CodeBlock
            code={`<dependencies>
    <!-- Other dependencies -->
    
    <!-- Dotenv for .env file support -->
    <dependency>
        <groupId>io.github.cdimascio</groupId>
        <artifactId>java-dotenv</artifactId>
        <version>5.2.2</version>
    </dependency>
</dependencies>`}
            id="maven-dependency"
            language="xml"
          />
        </div>
      ),
    },
    {
      id: 3,
      title: 'Step 3: Configure Environment',
      description: 'Set up environment variables for API connection',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Create a file named <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">.env</code> in your project root:
          </p>
          <CodeBlock
            code={`EZTEST_BASE_URL=https://api.eztest.io
EZTEST_API_TOKEN=your_secret_api_token
EZTEST_PROJECT_ID=${projectId}
EZTEST_ENVIRONMENT=QA_Staging`}
            id="env-file"
          />
          
          <div className="space-y-3 mt-4">
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                <strong>Important Rules:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Do NOT add <code className="bg-white/10 px-1 py-0.5 rounded">/api</code> to the base URL</li>
                  <li>Do NOT use quotes around values</li>
                  <li>No trailing spaces in values</li>
                  <li>Use HTTPS for production environments</li>
                  <li>Keep <code className="bg-white/10 px-1 py-0.5 rounded">.env</code> in <code className="bg-white/10 px-1 py-0.5 rounded">.gitignore</code></li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Step 4: Update pom.xml',
      description: 'Configure Maven plugins for automatic upload',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white/90 mb-2">Maven Failsafe Plugin</h4>
            <p className="text-sm text-white/60 mb-2">Runs TestNG properly and generates XML reports.</p>
            <CodeBlock
              code={`<build>
  <plugins>
    <!-- ✅ 1. FAILSAFE: Run TestNG properly -->
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-failsafe-plugin</artifactId>
      <version>3.2.5</version>
      <configuration>
        <suiteXmlFiles>
          <suiteXmlFile>testng.xml</suiteXmlFile>
        </suiteXmlFiles>
        <testFailureIgnore>true</testFailureIgnore>
      </configuration>
      <executions>
        <execution>
          <goals>
            <goal>integration-test</goal>
            <goal>verify</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>`}
              id="failsafe-plugin"
              language="xml"
            />
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-white/90 mb-2">Exec Maven Plugin</h4>
            <p className="text-sm text-white/60 mb-2">Automatically uploads results after tests complete.</p>
            <CodeBlock
              code={`<build>
  <plugins>
    <plugin>
      <groupId>org.codehaus.mojo</groupId>
      <artifactId>exec-maven-plugin</artifactId>
      <version>3.1.0</version>
      <executions>
        <execution>
          <id>upload-eztest-results</id>
          <phase>verify</phase>
          <goals>
            <goal>java</goal>
          </goals>
          <configuration>
            <classpathScope>test</classpathScope>
            <mainClass>utils.EZTestCreateTestRunUploaderMain</mainClass>
            <arguments>
              <argument>target/failsafe-reports/testng-results.xml</argument>
            </arguments>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>`}
              id="exec-plugin"
              language="xml"
            />
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Step 5: Test Case Naming',
      description: 'Important naming convention for test methods',
      content: (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>VERY IMPORTANT:</strong> EZTest matches test cases using method names.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium text-white/90 mb-2">✅ Correct Format</h4>
            <CodeBlock
              code={`@Test
public void TC_1() { 
    // Your test code
}

@Test
public void TC_2() { 
    // Your test code
}`}
              id="correct-format"
              language="java"
            />
          </div>

          <div>
            <h4 className="font-medium text-white/90 mb-2">❌ Incorrect Format</h4>
            <CodeBlock
              code={`// ❌ This will NOT work
@Test(testName = "TC-1")
public void loginTest() { 
    // Your test code
}`}
              id="incorrect-format"
              language="java"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2"><strong>Key Points:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm text-white/60">
              <li>Use <code className="bg-white/10 px-1 py-0.5 rounded">TC_1</code> format in code (with underscore)</li>
              <li>EZTest maps it to <code className="bg-white/10 px-1 py-0.5 rounded">TC-1</code> (with hyphen) automatically</li>
              <li>Method name must match test case <code className="bg-white/10 px-1 py-0.5 rounded">tcId</code> in EZTest</li>
              <li>Case-sensitive matching</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm font-medium text-white/90 mb-2">Example Mapping:</p>
            <table className="w-full text-sm text-white/70">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2">TestNG Method Name</th>
                  <th className="text-left py-2">EZTest Test Case ID</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2"><code className="bg-white/10 px-1.5 py-0.5 rounded">TC_1()</code></td>
                  <td className="py-2"><code className="bg-white/10 px-1.5 py-0.5 rounded">TC-1</code></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2"><code className="bg-white/10 px-1.5 py-0.5 rounded">TC_LOGIN_001()</code></td>
                  <td className="py-2"><code className="bg-white/10 px-1.5 py-0.5 rounded">TC-LOGIN-001</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Step 6: Run Tests',
      description: 'Execute tests and verify automatic upload',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white/90 mb-2">Using Maven Verify (Recommended)</h4>
            <CodeBlock
              code="mvn clean verify"
              id="maven-verify"
            />
            <p className="text-sm text-white/60 mt-2">
              This command will:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-white/60 mt-2">
              <li>Clean previous builds</li>
              <li>Run all tests</li>
              <li>Generate TestNG XML reports</li>
              <li>Automatically upload results to EZTest (verify phase)</li>
              <li>Complete the build</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-white/90 mb-2">What Happens Automatically</h4>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Tests execute using TestNG</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>TestNG generates XML reports (e.g., testng-results.xml)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Results are automatically uploaded to EZTest</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Test Run is created in EZTest with execution details</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Test case results are updated (PASS/FAIL/SKIPPED)</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Complete!',
      description: 'Your automation setup is ready',
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/90 mb-2">Setup Complete!</h3>
            <p className="text-sm text-white/60">
              Your automation integration is configured. Test runs will be automatically uploaded to EZTest.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="font-medium text-white/90 mb-3">Final Checklist</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Added 2 Java files to your project</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Updated pom.xml with required plugins</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Added java-dotenv dependency</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Created .env file with all required variables</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Verified test case IDs match TestNG method names</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Used TC_1 naming format (with underscore)</span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              For detailed documentation and troubleshooting, see:{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded">docs/integrations/testng-maven-integration.md</code>
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] flex flex-col p-0 overflow-hidden max-h-[90vh] min-h-[600px] h-[85vh]">
        <div className="flex-shrink-0 border-b border-white/10 bg-[#0f172a] px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Automation Setup Guide
            </DialogTitle>
            <DialogDescription className="mt-2">
              Step-by-step guide to integrate TestNG automation with EZTest
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="mt-4 flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    index === currentStep
                      ? 'border-primary bg-primary/20 text-primary'
                      : index < currentStep
                      ? 'border-green-400 bg-green-400/20 text-green-400'
                      : 'border-white/20 bg-white/5 text-white/40'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{step.id + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      index < currentStep ? 'bg-green-400' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
          <div className="py-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white/90">{currentStepData.title}</h3>
              <p className="text-sm text-white/60 mt-1">{currentStepData.description}</p>
            </div>
            <div className="mt-6">{currentStepData.content}</div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f172a] px-6 py-4 flex gap-3 justify-between">
          <Button
            type="button"
            variant="glass"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="glass"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Close
            </Button>
            {currentStep < steps.length - 1 ? (
              <ButtonPrimary
                type="button"
                onClick={handleNext}
                className="cursor-pointer"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                type="button"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Done
              </ButtonPrimary>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

