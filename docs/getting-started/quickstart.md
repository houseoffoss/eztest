# Quick Start Guide

Get EzTest running in 5 minutes.

## 🚀 The Fastest Path

### Step 1: Clone & Start (2 minutes)

```bash
# Clone the repository
git clone https://github.com/houseoffoss/eztest.git
cd eztest

# Copy environment file
cp .env.example .env

# Start with Docker
docker-compose up -d
```

### Step 2: Initialize Database (1 minute)

```bash
# Set up database schema and seed data
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

### Step 3: Access EZTest (Done!)

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Login with:**
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

---

## 📝 Quick Walkthrough

### 1. Dashboard

After logging in, you'll see the dashboard with:
- Project overview
- Recent activity
- Quick stats

### 2. Create Your First Project

1. Click **"Projects"** in the sidebar
2. Click **"Create Project"** button
3. Fill in:
   - **Name**: My First Project
   - **Key**: MFP (unique identifier)
   - **Description**: A test project
4. Click **"Create"**

### 3. Add a Test Case

1. Open your project
2. Navigate to **"Test Cases"** tab
3. Click **"Create Test Case"**
4. Fill in:
   - **Title**: User Login Test
   - **Description**: Verify user can login successfully
   - **Priority**: High
5. Add test steps:
   - Step 1: Navigate to login page → Login form is displayed
   - Step 2: Enter valid credentials → Fields accept input
   - Step 3: Click login button → User is logged in
6. Click **"Save"**

### 4. Create a Test Run

1. Navigate to **"Test Runs"** tab
2. Click **"Create Test Run"**
3. Fill in:
   - **Name**: Sprint 1 Testing
   - **Environment**: Staging
4. Select test cases to include
5. Click **"Create"**

### 5. Execute Tests

1. Open your test run
2. Click **"Start"** to begin execution
3. For each test case:
   - Execute the steps
   - Mark result: Pass, Fail, Blocked, or Skip
   - Add comments if needed
4. Click **"Complete"** when done

---

## 🔧 Quick Configuration

### Change the Port

Edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8080:3000"  # Change 8080 to your preferred port
```

### Enable Email Notifications

Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourcompany.com
```

### Enable File Attachments

Add to `.env`:

```env
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PATH_PREFIX=prod
```

---

## 🎯 Key Concepts

| Concept | Description |
|---------|-------------|
| **Project** | Container for all test assets, with team members |
| **Test Suite** | Folder for organizing test cases hierarchically |
| **Test Case** | Individual test with steps and expected results |
| **Test Run** | Execution instance containing multiple test cases |
| **Test Result** | Outcome of executing a test case (Pass/Fail/etc.) |
| **Defect** | Bug or issue found during testing |

---

## 📚 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management |
| **Project Manager** | Create/manage projects, full project access |
| **Tester** | Execute tests, create defects, view reports |
| **Viewer** | Read-only access to assigned projects |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search |
| `N` | New item (context-aware) |
| `E` | Edit selected item |
| `?` | Show keyboard shortcuts |

---

## 🔍 What's Next?

- **[Create Your First Project](./first-project.md)** - Detailed project setup guide
- **[Configuration](./configuration.md)** - All configuration options
- **[Features Overview](../features/README.md)** - Explore all features
- **[API Reference](../api/README.md)** - Integrate with your tools

---

## ❓ Common Questions

### How do I reset my password?

Click "Forgot Password" on the login page and enter your email.

### How do I add team members?

1. Open a project
2. Go to **Members** tab
3. Click **Add Member**
4. Enter email and select role

### How do I export test results?

1. Open a test run
2. Click **Export** button
3. Choose format (PDF, CSV, or email)

### How do I back up my data?

```bash
# Backup PostgreSQL database
docker-compose exec postgres pg_dump -U eztest eztest > backup.sql

# Restore
docker-compose exec -T postgres psql -U eztest eztest < backup.sql
```

---

## 🆘 Need Help?

- **Documentation**: [Full docs](../README.md)
- **Troubleshooting**: [Common issues](../operations/troubleshooting.md)
- **GitHub Issues**: [Report bugs](https://github.com/houseoffoss/eztest/issues)

