# Features Overview

Comprehensive documentation for all EZTest features.

## Feature Status

| Feature | Status | Documentation |
|---------|--------|---------------|
| **Authentication & Security** | ✅ Complete | [View Docs](./authentication/README.md) |
| **Project Management** | ✅ Complete | [View Docs](./projects/README.md) |
| **Modules** | ✅ Complete | [View Docs](./modules/README.md) |
| **Test Cases** | ✅ Complete | [View Docs](./test-cases/README.md) |
| **Test Suites** | ✅ Complete | [View Docs](./test-suites/README.md) |
| **Test Runs** | ✅ Complete | [View Docs](./test-runs/README.md) |
| **Defect Tracking** | ✅ Complete | [View Docs](./defects/README.md) |
| **File Attachments** | ✅ Complete | [View Docs](./attachments/README.md) |
| **Email Notifications** | ✅ Complete | [View Docs](./email/README.md) |
| **Dashboard & Analytics** | 🚧 In Progress | Coming Soon |
| **Requirements Traceability** | 📋 Planned | Coming Soon |

---

## Core Features

### 🔐 [Authentication & Security](./authentication/README.md)

Secure user authentication and role-based access control.

**Capabilities:**
- Email/password authentication with bcrypt hashing
- JWT-based session management
- Password reset with email verification
- OTP verification for sensitive actions
- 4 system roles with 27 granular permissions

**Quick Links:**
- See [Authentication Documentation](./authentication/README.md) for complete details

---

### 📁 [Project Management](./projects/README.md)

Organize testing efforts with multi-project support.

**Capabilities:**
- Create and manage multiple projects
- Unique project keys (e.g., ECOM, MAT)
- Team membership with project-level roles
- Project statistics

**Quick Links:**
- See [Projects Documentation](./projects/README.md) for complete details

---

### � [Modules](./modules/README.md)

Organize test cases by feature or component within a project.

**Capabilities:**
- Group test cases into logical modules
- Feature-based or component-based organization
- Module-level test case management
- Custom ordering and descriptions
- Flexible test case assignment

**Quick Links:**
- See [Modules Documentation](./modules/README.md) for complete details

---

### �📝 [Test Cases](./test-cases/README.md)

Create and manage comprehensive test cases.

**Capabilities:**
- Full CRUD operations for test cases
- Auto-generated sequential IDs (tc1, tc2, tc3)
- Priority levels: Critical, High, Medium, Low
- Status tracking: Active, Draft, Deprecated
- Detailed test steps with expected results
- File attachments support

**Quick Links:**
- See [Test Cases Documentation](./test-cases/README.md) for complete details

---

### 📂 [Test Suites](./test-suites/README.md)

Organize test cases with hierarchical test suites.

**Capabilities:**
- Create nested test suites (unlimited depth)
- Parent-child relationships
- Move and reorder suites
- Test case associations
- Suite statistics

**Quick Links:**
- See [Test Suites Documentation](./test-suites/README.md) for complete details

---

### ▶️ [Test Runs](./test-runs/README.md)

Execute tests and track results.

**Capabilities:**
- Create and manage test runs
- Assign runs to team members
- Environment-specific execution
- Run status tracking
- Result recording with comments
- Email reports

**Quick Links:**
- See [Test Runs Documentation](./test-runs/README.md) for complete details

---

### 🐛 [Defect Tracking](./defects/README.md)

Track and manage bugs found during testing.

**Capabilities:**
- Create defects linked to test cases
- Severity and priority classification
- Status workflow (New → Closed)
- Assignment and tracking
- File attachments and comments

**Quick Links:**
- See [Defects Documentation](./defects/README.md) for complete details

---

### 📎 [File Attachments](./attachments/README.md)

Attach files to test cases, defects, and comments.

**Capabilities:**
- Direct S3 upload with presigned URLs
- Support for files up to 500MB
- Multi-part upload for large files
- Image previews
- Download with original filenames

**Quick Links:**
- See [Attachments Documentation](./attachments/README.md) for complete details

---

### 📧 [Email Notifications](./email/README.md)

Email notifications for various events and actions.

**Capabilities:**
- Password reset emails
- OTP verification emails
- Defect assignment notifications
- Defect update notifications
- Test run reports
- User and project invitations

**Quick Links:**
- [SMTP Configuration](./email/README.md#smtp-configuration)
- [Email Types](./email/README.md#email-types)
- [Troubleshooting](./email/README.md#troubleshooting)

---

## Feature Comparison

### EZTest vs Commercial Tools

| Feature | EZTest | TestRail | Testiny |
|---------|--------|----------|---------|
| **Self-Hosted** | ✅ | ❌ | ❌ |
| **Open Source** | ✅ | ❌ | ❌ |
| **Test Case Management** | ✅ | ✅ | ✅ |
| **Test Runs** | ✅ | ✅ | ✅ |
| **Defect Tracking** | ✅ | ✅ | ✅ |
| **RBAC** | ✅ | ✅ | ✅ |
| **File Attachments** | ✅ | ✅ | ✅ |
| **API** | ✅ | ✅ | ✅ |
| **Pricing** | Free | $$$$ | $$$ |

---

## Upcoming Features

### Dashboard & Analytics
- Project dashboards with charts
- Test execution trends
- Pass/fail rate analysis
- Team performance metrics

### Requirements Traceability
- Link test cases to requirements
- Coverage matrix
- Traceability reports

### Integrations
- Jira integration
- GitHub integration
- Azure DevOps integration
- CI/CD pipeline support

### Advanced Reporting
- Custom report templates
- Scheduled reports
- Export to PDF/Excel

---

## Feature Requests

Have a feature request? We'd love to hear from you!

- **GitHub Issues**: [Submit a feature request](https://github.com/houseoffoss/eztest/issues/new?template=feature_request.md)
- **Discussions**: [Join the conversation](https://github.com/houseoffoss/eztest/discussions)
