#!/usr/bin/env node

/**
 * Smart test runner
 * Supports: npm run test --playwright
 * Usage:
 *   npm run test                    # Run tests
 *   npm run test -- --ui           # Run with UI
 *   npm run test -- --debug        # Debug mode
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const automationDir = path.join(__dirname, '..', 'automation');

// Build command
let cmd = 'playwright test';

// Default to --headed mode (browser visible to watch)
if (args.length === 0) {
  // Run tests with browser visible, one at a time
  cmd += ' --headed --workers=1';
} else {
  // Pass through any arguments (--ui, --debug, etc.)
  cmd += ' ' + args.join(' ');
}

console.log(`🧪 Running: ${cmd}`);
console.log(`📁 In directory: ${automationDir}\n`);

try {
  execSync(cmd, {
    cwd: automationDir,
    stdio: 'inherit',
    shell: true
  });
  process.exit(0);
} catch (error) {
  process.exit(1);
}
