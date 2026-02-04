'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { GlassFooter } from '@/frontend/reusable-components/layout/GlassFooter';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';

const navItems = [
  { label: 'Features', href: '/#features' },
  { label: 'Why Choose?', href: '/#why-choose' },
];

export default function PrivacyPolicyPage() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // Fetch GitHub stars count
    fetch('https://api.github.com/repos/houseoffoss/eztest')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fail if API request fails
        setStars(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={navItems}
        breadcrumbs={
          <>
            <a
              href="https://github.com/houseoffoss/eztest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5 text-white transition-colors hover:text-white/80"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Star on GitHub</span>
              {stars !== null && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">{stars.toLocaleString()}</span>
                </span>
              )}
            </a>
            <Link
              href="/houseoffoss"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5 text-white transition-colors hover:text-white/80"
            >
              <span className="text-sm">Self host in minutes with</span>
              <Image
                src="/houseoffoss.jpg"
                alt="House Of FOSS"
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
              />
            </Link>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <ButtonSecondary className="cursor-pointer" buttonName="Privacy Policy - Navbar - Sign In">
                Sign in
              </ButtonSecondary>
            </Link>
            <Link href="/auth/register">
              <ButtonPrimary className="cursor-pointer" buttonName="Privacy Policy - Navbar - Get Started">
                Get started
              </ButtonPrimary>
            </Link>
          </div>
        }
      />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: December 19, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to EZTest. We are committed to protecting your privacy and ensuring transparency about how we handle data. 
              This Privacy Policy explains our practices regarding data collection, use, and protection in our self-hosted test management platform.
            </p>
            <p className="mb-4">
              <strong className="text-white">Important Note:</strong> EZTest is designed as a self-hosted solution. When you deploy EZTest on your own infrastructure, 
              you maintain complete control over your data. This policy primarily addresses the open-source project and any official instances we may operate.
            </p>
          </section>

          {/* Self-Hosted Nature */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Self-Hosted Architecture</h2>
            <p className="mb-4">
              EZTest is built to be self-hosted, meaning:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You install and run EZTest on your own servers or infrastructure</li>
              <li>All data remains within your environment and under your control</li>
              <li>We (the EZTest developers) do not have access to your instance&apos;s data</li>
              <li>You are the data controller for any data processed by your EZTest instance</li>
              <li>You are responsible for implementing appropriate security measures for your deployment</li>
            </ul>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information Collection</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.1 Data Stored in Your EZTest Instance</h3>
            <p className="mb-4">
              When you use your self-hosted EZTest instance, the following types of data are stored in your local database:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li><strong className="text-white">Account Information:</strong> Name, email address, password (hashed), profile details</li>
              <li><strong className="text-white">Project Data:</strong> Project names, descriptions, settings, and configurations</li>
              <li><strong className="text-white">Test Cases:</strong> Test case details, descriptions, steps, expected results</li>
              <li><strong className="text-white">Test Suites:</strong> Test suite organization and structure</li>
              <li><strong className="text-white">Test Runs:</strong> Execution history, results, and associated metadata</li>
              <li><strong className="text-white">Team Information:</strong> User roles, permissions, and project memberships</li>
              <li><strong className="text-white">Usage Metadata:</strong> Timestamps, activity logs, and system-generated data</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How Information Is Used</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 Within Your Self-Hosted Instance</h3>
            <p className="mb-4">
              Your EZTest instance uses data to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>Provide test management functionality</li>
              <li>Enable team collaboration and project management</li>
              <li>Generate reports and analytics for your testing activities</li>
              <li>Authenticate users and manage access controls</li>
              <li>Send email notifications (if configured by your instance administrator)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">4.2 Open Source Development</h3>
            <p className="mb-4">
              Aggregated, anonymized data from opt-in telemetry (if implemented) may be used to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Improve software features and performance</li>
              <li>Identify and fix bugs</li>
              <li>Understand feature usage patterns</li>
              <li>Guide product development priorities</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Storage and Security</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Your Responsibility</h3>
            <p className="mb-4">
              As a self-hosted solution, you are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>Securing your infrastructure and database</li>
              <li>Implementing appropriate access controls</li>
              <li>Maintaining regular backups</li>
              <li>Ensuring HTTPS/TLS encryption for data in transit</li>
              <li>Complying with applicable data protection regulations (GDPR, CCPA, etc.)</li>
              <li>Managing user access and permissions appropriately</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">5.2 Security Features</h3>
            <p className="mb-4">
              EZTest includes built-in security features:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Password hashing using industry-standard algorithms (bcrypt)</li>
              <li>Role-based access control (RBAC) system</li>
              <li>Session management and authentication via NextAuth.js</li>
              <li>Protection against common vulnerabilities (XSS, CSRF, SQL injection)</li>
              <li>Secure API endpoints with authentication middleware</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Sharing and Third Parties</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.1 We Don&apos;t Share Your Data</h3>
            <p className="mb-4">
              Since EZTest is self-hosted:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>We (the EZTest developers) do not have access to your instance data</li>
              <li>We do not sell, rent, or trade any data</li>
              <li>Your data is not shared with third parties unless you explicitly configure integrations</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">6.2 Optional Integrations</h3>
            <p className="mb-4">
              If you configure external integrations (email services, authentication providers, etc.), data may be shared with those services 
              according to your configuration and their respective privacy policies.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
            <p className="mb-4">
              As a user of a self-hosted EZTest instance, you have rights regarding your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li><strong className="text-white">Access:</strong> You can view and export your data through the application interface</li>
              <li><strong className="text-white">Rectification:</strong> You can update your profile and correct inaccurate data</li>
              <li><strong className="text-white">Deletion:</strong> You can request account deletion from your instance administrator</li>
              <li><strong className="text-white">Data Portability:</strong> You can export your data in standard formats</li>
              <li><strong className="text-white">Objection:</strong> You can object to certain data processing activities</li>
            </ul>
            <p className="mb-4">
              Contact your EZTest instance administrator to exercise these rights or for questions about data handling in your organization.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention and Deletion</h2>
            <p className="mb-4">
              EZTest allows administrators to configure data retention policies based on their organizational requirements:
            </p>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">8.1 Retention Periods</h3>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li><strong className="text-white">User Accounts:</strong> Active accounts are retained indefinitely until deletion is requested or the account is deactivated by an administrator</li>
              <li><strong className="text-white">Project Data:</strong> Projects, test cases, test suites, and related data are retained as long as the project exists</li>
              <li><strong className="text-white">Test Run Results:</strong> Test execution history is retained according to your instance&apos;s configuration (typically indefinitely for audit purposes)</li>
              <li><strong className="text-white">Audit Logs:</strong> System activity logs may be retained for security and compliance purposes based on organizational policies</li>
              <li><strong className="text-white">Deleted Accounts:</strong> When an account is deleted, associated personal data is permanently removed, while test artifacts created by the user may be anonymized and retained for historical records</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">8.2 Data Deletion Options</h3>
            <p className="mb-4">
              Your EZTest instance administrator can configure automated data deletion policies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>Automatic deletion of inactive user accounts after a specified period of inactivity</li>
              <li>Scheduled cleanup of old test run results beyond a retention threshold</li>
              <li>Archived project data removal after a defined period</li>
              <li>Automatic purging of audit logs older than a specified timeframe</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3">8.3 Manual Deletion</h3>
            <p className="mb-4">
              Users and administrators can manually delete data at any time:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Users can delete their own test cases, test suites, and test runs they have created (subject to permissions)</li>
              <li>Project managers can delete entire projects and all associated data</li>
              <li>Administrators can remove user accounts, which triggers permanent deletion of personal information</li>
              <li>Administrators can execute database cleanup operations to remove orphaned or obsolete data</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Important:</strong> Deleted data cannot be recovered. Ensure you have appropriate backups before performing deletion operations. 
              For compliance with data protection regulations (GDPR, CCPA), contact your instance administrator to establish appropriate retention and deletion schedules.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Tracking</h2>
            <p className="mb-4">
              EZTest uses essential cookies for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Session management and authentication</li>
              <li>Maintaining user preferences</li>
              <li>Security features (CSRF protection)</li>
            </ul>
            <p className="mb-4">
              These cookies are necessary for the application to function properly. We do not use third-party tracking cookies or 
              advertising cookies in the core application.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
            <p className="mb-4">
              EZTest is not intended for use by individuals under the age of 13 (or the applicable age of digital consent in your jurisdiction). 
              We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal data, 
              please contact your instance administrator.
            </p>
          </section>

          {/* Open Source Notice */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Open Source Software</h2>
            <p className="mb-4">
              EZTest is open-source software licensed under the AGPL-3.0 License. The source code is publicly available on GitHub at{' '}
              <a 
                href="https://github.com/houseoffoss/eztest" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                github.com/houseoffoss/eztest
              </a>.
            </p>
            <p className="mb-4">
              You are free to review, modify, and audit the code to ensure it meets your privacy and security requirements. 
              We welcome community contributions to improve security and privacy features.
            </p>
          </section>

          {/* Demo Instance */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Official Demo Instance</h2>
            <p className="mb-4">
              We provide an official demo instance of EZTest for evaluation purposes at{' '}
              <a 
                href="https://eztest.houseoffoss.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                eztest.houseoffoss.com
              </a>.
            </p>
            <p className="mb-4">
              Data stored on the demo instance is subject to the following terms:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Demo data is periodically reset</li>
              <li>The demo instance is for testing and evaluation purposes only</li>
              <li>Do not store sensitive, confidential, or production data on the demo instance</li>
              <li>We reserve the right to review and remove inappropriate content</li>
              <li>Demo accounts may be deleted without notice as part of routine maintenance</li>
              <li>The demo instance may have limited features or resources compared to production deployments</li>
            </ul>
            <p className="mb-4">
              For production use, please deploy your own self-hosted instance following the installation instructions in our documentation.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically to reflect changes in our practices or for legal, operational, or regulatory reasons. 
              Changes will be posted in the EZTest repository and documentation. For self-hosted instances, updates to the privacy policy will be 
              included in software releases.
            </p>
            <p className="mb-4">
              We encourage you to review this policy periodically. Continued use of EZTest after changes indicates acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
            <p className="mb-4">
              For questions about this Privacy Policy or the EZTest project:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
              <li>
                <strong className="text-white">Demo Instance:</strong>{' '}
                <a 
                  href="https://eztest.houseoffoss.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  eztest.houseoffoss.com
                </a>
              </li>
              <li>
                <strong className="text-white">Project Issues:</strong>{' '}
                <a 
                  href="https://github.com/houseoffoss/eztest/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  GitHub Issues
                </a>
              </li>
              <li>
                <strong className="text-white">Email:</strong>{' '}
                <a 
                  href="mailto:info@belsterns.com" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  info@belsterns.com
                </a>
              </li>
              <li>
                <strong className="text-white">Repository:</strong>{' '}
                <a 
                  href="https://github.com/houseoffoss/eztest" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  github.com/houseoffoss/eztest
                </a>
              </li>
            </ul>
            <p className="mb-4">
              For questions about data handling in a specific EZTest instance, please contact that instance&apos;s administrator.
            </p>
          </section>

          {/* Self-Hosting Disclaimer */}
          <section className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">15. Self-Hosting Disclaimer</h2>
            <p className="mb-4 text-gray-400 italic">
              This Privacy Policy describes the practices of the EZTest open-source project. As a self-hosted solution, individual deployments 
              are operated independently by their respective administrators. Each organization deploying EZTest is responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400 italic">
              <li>Creating and maintaining their own privacy policy for their instance</li>
              <li>Ensuring compliance with applicable data protection laws</li>
              <li>Implementing appropriate security measures</li>
              <li>Managing user data according to their organizational policies</li>
              <li>Obtaining necessary consents from their users</li>
            </ul>
          </section>
        </div>
      </main>

      <GlassFooter />
    </div>
  );
}
