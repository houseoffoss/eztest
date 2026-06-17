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
        title="Скопировать в буфер"
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
      title: 'Предварительные требования',
      description: 'Убедитесь, что у вас есть нужные инструменты и доступы',
      content: (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Перед началом убедитесь, что у вас есть следующее:
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Java 8 or higher</p>
                <p className="text-sm text-white/60 mt-1">Требуется для запуска тестов на TestNG</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Maven 3.6+</p>
                <p className="text-sm text-white/60 mt-1">Инструмент сборки для проекта автоматизации</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Проект автоматизации на базе TestNG</p>
                <p className="text-sm text-white/60 mt-1">Проект на Maven с фреймворком TestNG</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">EZTest API Token</p>
                <p className="text-sm text-white/60 mt-1">Создайте в EZTest: Настройки → API ключи</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Project ID</p>
                <p className="text-sm text-white/60 mt-1">ID вашего проекта в EZTest: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">{projectId}</code></p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Шаг 1: Добавьте Java-файлы',
      description: 'Добавьте необходимые вспомогательные файлы в проект',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Добавьте ровно <strong className="text-white/90">2 Java-файла</strong> в проект по пути:
          </p>
          <CodeBlock code="src/test/java/utils/" id="folder-path" />
          
          <div className="space-y-6 mt-6">
            <div>
              <h4 className="font-medium text-white/90 mb-2 flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Файл 1: EZTestCreateTestRunUploader.java
              </h4>
              <p className="text-sm text-white/60 mb-2">
                Расположение: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">src/test/java/utils/EZTestCreateTestRunUploader.java</code>
              </p>
              <p className="text-xs text-white/50 mb-3">
                Этот файл отвечает за подключение к API, аутентификацию и бинарную отправку XML-файлов.
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
                Файл 2: EZTestCreateTestRunUploaderMain.java
              </h4>
              <p className="text-sm text-white/60 mb-2">
                Расположение: <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">src/test/java/utils/EZTestCreateTestRunUploaderMain.java</code>
              </p>
              <p className="text-xs text-white/50 mb-3">
                Главный класс, который запускается через Maven exec-plugin для отправки результатов.
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
              <strong>Примечание:</strong> Вы можете изменить имя пакета (например, <code className="bg-white/10 px-1 py-0.5 rounded">com.example.utils</code>), 
              но оно должно совпадать в обоих Java-файлах и в конфигурации <code className="bg-white/10 px-1 py-0.5 rounded">pom.xml</code>.
            </AlertDescription>
          </Alert>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60">
              <strong className="text-white/80">📚 Полная документация:</strong>{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded">docs/integrations/testng-maven-integration.md</code>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Шаг 2: Добавьте зависимости',
      description: 'Добавьте необходимые Maven-зависимости в pom.xml',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Добавьте следующую зависимость в <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">pom.xml</code>:
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
      title: 'Шаг 3: Настройте окружение',
      description: 'Укажите переменные окружения для подключения к API',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            Создайте файл <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">.env</code> в корне проекта:
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
                <strong>Важные правила:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Не добавляйте <code className="bg-white/10 px-1 py-0.5 rounded">/api</code> в базовый URL</li>
                  <li>Не используйте кавычки вокруг значений</li>
                  <li>Не оставляйте пробелы в конце значений</li>
                  <li>Используйте HTTPS для production-окружений</li>
                  <li>Добавьте <code className="bg-white/10 px-1 py-0.5 rounded">.env</code> в <code className="bg-white/10 px-1 py-0.5 rounded">.gitignore</code></li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Шаг 4: Обновите pom.xml',
      description: 'Настройте Maven-плагины для автоматической отправки',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white/90 mb-2">Maven Failsafe Plugin</h4>
            <p className="text-sm text-white/60 mb-2">Корректно запускает TestNG и формирует XML-отчеты.</p>
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
            <p className="text-sm text-white/60 mb-2">Автоматически отправляет результаты после завершения тестов.</p>
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
      title: 'Шаг 5: Именование тест-кейсов',
      description: 'Важное правило именования тестовых методов',
      content: (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>ОЧЕНЬ ВАЖНО:</strong> EZTest сопоставляет тест-кейсы по имени метода.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium text-white/90 mb-2">✅ Правильный формат</h4>
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
            <h4 className="font-medium text-white/90 mb-2">❌ Неправильный формат</h4>
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
            <p className="text-sm text-white/70 mb-2"><strong>Ключевые моменты:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm text-white/60">
              <li>Используйте в коде формат <code className="bg-white/10 px-1 py-0.5 rounded">TC_1</code> (с подчеркиванием)</li>
              <li>EZTest автоматически преобразует его в <code className="bg-white/10 px-1 py-0.5 rounded">TC-1</code> (с дефисом)</li>
              <li>Имя метода должно совпадать с <code className="bg-white/10 px-1 py-0.5 rounded">tcId</code> тест-кейса в EZTest</li>
              <li>Регистр символов имеет значение</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm font-medium text-white/90 mb-2">Пример сопоставления:</p>
            <table className="w-full text-sm text-white/70">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2">Имя метода TestNG</th>
                  <th className="text-left py-2">ID тест-кейса в EZTest</th>
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
      title: 'Шаг 6: Запустите тесты',
      description: 'Выполните тесты и проверьте автоматическую отправку результатов',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white/90 mb-2">Через Maven Verify (рекомендуется)</h4>
            <CodeBlock
              code="mvn clean verify"
              id="maven-verify"
            />
            <p className="text-sm text-white/60 mt-2">
              Эта команда:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-white/60 mt-2">
              <li>Очистит предыдущие сборки</li>
              <li>Запустит все тесты</li>
              <li>Сгенерирует XML-отчеты TestNG</li>
              <li>Автоматически отправит результаты в EZTest (фаза verify)</li>
              <li>Завершит сборку</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-white/90 mb-2">Что происходит автоматически</h4>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Тесты выполняются через TestNG</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>TestNG генерирует XML-отчеты (например, testng-results.xml)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Результаты автоматически отправляются в EZTest</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>В EZTest создается Test Run с деталями выполнения</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Обновляются статусы тест-кейсов (PASS/FAIL/SKIPPED)</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Готово!',
      description: 'Настройка автоматизации завершена',
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/90 mb-2">Настройка завершена!</h3>
            <p className="text-sm text-white/60">
              Интеграция автоматизации настроена. Test Run будут автоматически загружаться в EZTest.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="font-medium text-white/90 mb-3">Финальный чеклист</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Добавлены 2 Java-файла в проект</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Обновлен pom.xml с нужными плагинами</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Добавлена зависимость java-dotenv</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Создан .env со всеми необходимыми переменными</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Проверено совпадение ID тест-кейсов с именами методов TestNG</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/70">Использован формат именования TC_1 (с подчеркиванием)</span>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-xs">
              Для подробной документации и устранения проблем см.:{' '}
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
        <div className="flex-shrink-0 border-b border-white/10 bg-[#0f0f12] px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Руководство по настройке автоматизации
            </DialogTitle>
            <DialogDescription className="mt-2">
              Пошаговое руководство по интеграции автоматизации TestNG с EZTest
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

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f0f12] px-6 py-4 flex gap-3 justify-between">
          <Button
            type="button"
            variant="glass"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="glass"
              onClick={handleClose}
              className="cursor-pointer"
            >
              Закрыть
            </Button>
            {currentStep < steps.length - 1 ? (
              <ButtonPrimary
                type="button"
                onClick={handleNext}
                className="cursor-pointer"
              >
                Далее
                <ChevronRight className="h-4 w-4 ml-2" />
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                type="button"
                onClick={handleClose}
                className="cursor-pointer"
              >
                Готово
              </ButtonPrimary>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

