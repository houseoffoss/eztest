'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              EZTest is open-source software licensed under the MIT License. The source code is publicly available on GitHub at{' '}
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
                  href="mailto:philip.moses@belsterns.com" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  philip.moses@belsterns.com
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

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500">
          <p className="mb-2">
            EZTest is an open-source project licensed under the MIT License
          </p>
          <p>
            <a 
              href="https://github.com/houseoffoss/eztest" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              View on GitHub
            </a>
            {' · '}
            <Link 
              href="/" 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Back to Home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
