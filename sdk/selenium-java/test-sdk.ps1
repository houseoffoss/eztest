# PowerShell script to test the SDK
# Make sure you've set environment variables before running:
# $env:EZTEST_SERVER_URL = "http://localhost:3000"
# $env:EZTEST_API_KEY = "your-api-key-here"
# $env:EZTEST_PROJECT_ID = "your-project-id"

Write-Host "=== EZTest SDK Test Script ===" -ForegroundColor Cyan

# Check environment variables
if (-not $env:EZTEST_SERVER_URL) {
    Write-Host "ERROR: EZTEST_SERVER_URL not set!" -ForegroundColor Red
    exit 1
}
if (-not $env:EZTEST_API_KEY) {
    Write-Host "ERROR: EZTEST_API_KEY not set!" -ForegroundColor Red
    exit 1
}
if (-not $env:EZTEST_PROJECT_ID) {
    Write-Host "ERROR: EZTEST_PROJECT_ID not set!" -ForegroundColor Red
    exit 1
}

# Build SDK
Write-Host "`n[1/4] Building SDK..." -ForegroundColor Green
mvn clean compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Get classpath
Write-Host "`n[2/4] Getting dependencies..." -ForegroundColor Green
mvn dependency:build-classpath "-Dmdep.outputFile=classpath.txt"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to get classpath!" -ForegroundColor Red
    exit 1
}
$classpath = Get-Content classpath.txt -Raw

# Compile example
Write-Host "`n[3/4] Compiling example..." -ForegroundColor Green
javac -cp "target/classes;$classpath" samples/JsonReportImportExample.java
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}

# Run example
Write-Host "`n[4/4] Running example..." -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
java -cp "samples;target/classes;$classpath" com.eztest.sdk.samples.JsonReportImportExample
Write-Host "---" -ForegroundColor Gray

Write-Host "`n✅ Test completed!" -ForegroundColor Green

