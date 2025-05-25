# 📧 Email Archiver

A backend service to archive every incoming email from a G-Suite inbox, storing all details and attachments securely for compliance and business records.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Google Cloud & OAuth Configuration](#google-cloud--oauth-configuration)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [How It Works](#how-it-works)
- [Endpoints](#endpoints)
- [Example Logs & Outputs](#example-logs--outputs)
- [Security Notes](#security-notes)
- [License](#license)

---

## Features

- **OAuth2 login** (no passwords) with Google for secure integration.
- **Automatic archiving** of all new incoming emails (every 5 minutes).
- **Email details, body (plain+HTML), metadata (sender, recipient, CC, BCC, threading)** stored in PostgreSQL.
- **Attachments uploaded to Google Drive** and linked in the database.
- **De-duplication** – same email never stored twice.
- Handles **threading**, CC/BCC, large mailboxes, and advanced Gmail formats.

---

## Architecture

- **NestJS** modular backend (TypeScript)
- **Gmail API** (read-only)
- **Drive API** (upload for attachments)
- **PostgreSQL** ([TypeORM](https://typeorm.io/) for schema, indexes)
- **OAuth2** for secure, password-less API access
- **ScheduleModule** for periodic fetching

### Project Structure
src/
├── auth/ # OAuth and credential management
├── database/ # DB connection settings (TypeORM)
├── drive/ # Drive upload logic
├── email/ # Entities & logic for email/attachment
├── gmail/ # Gmail API logic (fetching emails)
├── scheduler/ # Periodic tasking


## Setup & Installation
### Prerequisites
Node.js (16.x or higher)
PostgreSQL database

### 1. Clone the repository
```
git clone <repo-url>
cd email-archiver
```
2. Install dependencies
```
npm install
```
3. Set up Google Cloud OAuth2

4. Set up environment variables
Create a .env file (do NOT commit this to git!):

ENV

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=email_archiver
```

5. Prepare PostgreSQL Database
```
CREATE DATABASE email_archiver;
```
### Running the Project

```npm run start```

The app runs at http://localhost:3000.

### How It Works
* On first run, app will log a URL for Google OAuth (/auth/google endpoint).
* Visit the URL, sign in to the G-Suite inbox you want to archive, and give consent.
* App exchanges consent for tokens, stores them securely.
* Every 5 minutes, the scheduler will:
* Poll for new emails
* Parse full email info
* Deduplicate and save to database
* Download and save attachments to Google Drive
* You can monitor logs or DB for archived communications.
  
### Endpoints
```bash
GET /auth/google
```
Redirects user to Google for consent flow.

```bash
GET /auth/google/callback?code=...
Handles redirect from Google, saves tokens.
```

Example Logs & Outputs

1[AuthService] ✅ Token file found, attempting to load it
2[EmailService] Email saved with ID: 42
3[DriveService] ✅ Uploaded to Drive: 1ABCd...
4[SchedulerService] Processed 3 messages.

## Developed By
Vageshwari Chaudhary
