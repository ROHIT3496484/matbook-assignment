# Form Builder - Employee Onboarding System

A modern, dynamic form builder application for employee onboarding built with Next.js 15, React, and TypeScript.

---

## Overview

Form Builder is a full-stack web application that enables organizations to collect employee onboarding information through a dynamic, schema-driven form. The application features a clean, professional UI with real-time validation, submission management, and data export capabilities.

---

## Features

- **Dynamic Form Generation** - Forms are generated from a JSON schema, making it easy to modify fields without code changes
- **Multiple Field Types** - Supports text, email, phone, number, select dropdowns, checkboxes, date pickers, textareas, and toggle switches
- **Real-time Validation** - Client-side validation with error messages for required fields and format validation
- **Submissions Management** - View, sort, and paginate through all form submissions
- **Export to CSV** - Download all submissions as a CSV file for reporting
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Built with Tailwind CSS and shadcn/ui components

---

## Tech Stack

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| Next.js 15     | React framework with App Router  |
| React 18       | UI library                       |
| TypeScript     | Type safety                      |
| Tailwind CSS   | Styling                          |
| shadcn/ui      | UI components                    |
| Lucide React   | Icons                            |

---

## Project Structure

\`\`\`
form-builder/
│
├── app/
│   ├── api/
│   │   ├── form-schema/
│   │   │   └── route.ts          # GET form schema endpoint
│   │   └── submissions/
│   │       ├── route.ts          # GET/POST submissions
│   │       └── [id]/
│   │           └── route.ts      # GET/DELETE single submission
│   │
│   ├── submissions/
│   │   ├── page.tsx              # Submissions list page
│   │   └── loading.tsx           # Loading state
│   │
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Form page (home)
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── switch.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   └── dynamic-form.tsx          # Main form component
│
├── lib/
│   ├── submissions-store.ts      # In-memory data store
│   └── utils.ts                  # Utility functions
│
├── public/                       # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
\`\`\`

---

## Form Fields

The Employee Onboarding Form includes the following fields:

| Field         | Type            | Required | Description                    |
| ------------- | --------------- | -------- | ------------------------------ |
| Full Name     | Text            | Yes      | Employee's full name           |
| Email Address | Email           | Yes      | Work email address             |
| Phone Number  | Phone           | Yes      | Contact number                 |
| Age           | Number          | Yes      | Employee's age                 |
| Department    | Select Dropdown | Yes      | Engineering, Design, etc.      |
| Skills        | Multi-checkbox  | Yes      | JavaScript, TypeScript, etc.   |
| Start Date    | Date Picker     | Yes      | Employment start date          |
| Bio           | Textarea        | No       | Brief introduction             |
| Remote Work   | Toggle Switch   | No       | Work preference                |

---

## API Documentation

### Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

### Endpoints

#### Get Form Schema
\`\`\`http
GET /api/form-schema
\`\`\`
Returns the JSON schema configuration for the form.

#### List Submissions
\`\`\`http
GET /api/submissions?page=1&limit=10&sortOrder=desc
\`\`\`
**Query Parameters:**
| Parameter  | Type   | Default | Description              |
| ---------- | ------ | ------- | ------------------------ |
| page       | number | 1       | Page number              |
| limit      | number | 10      | Items per page           |
| sortOrder  | string | desc    | Sort order (asc/desc)    |

#### Create Submission
\`\`\`http
POST /api/submissions
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "age": 28,
  "department": "engineering",
  "skills": ["JavaScript", "TypeScript"],
  "startDate": "2025-01-15",
  "bio": "Software developer",
  "remoteWork": true
}
\`\`\`

#### Get Single Submission
\`\`\`http
GET /api/submissions/:id
\`\`\`

#### Delete Submission
\`\`\`http
DELETE /api/submissions/:id
\`\`\`

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/ROHIT3496484/v0-matbook-assignment.git
cd v0-matbook-assignment
\`\`\`

**2. Install dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Run the development server**
\`\`\`bash
npm run dev
\`\`\`

**4. Open in browser**
\`\`\`
http://localhost:3000
\`\`\`

---

## Git Workflow

### Branch Strategy

| Branch       | Purpose                              |
| ------------ | ------------------------------------ |
| main         | Production-ready code                |
| develop      | Development integration branch       |
| feature/*    | New features                         |
| bugfix/*     | Bug fixes                            |
| hotfix/*     | Urgent production fixes              |

### Commit Message Convention

Follow the conventional commits specification:

| Type     | Description                    |
| -------- | ------------------------------ |
| feat     | New feature                    |
| fix      | Bug fix                        |
| docs     | Documentation changes          |
| style    | Formatting, styling changes    |
| refactor | Code restructuring             |
| test     | Adding tests                   |
| chore    | Maintenance tasks              |

### Example Commits

\`\`\`bash
# Adding new feature
git commit -m "feat: add CSV export functionality"

# Fixing a bug
git commit -m "fix: resolve date picker timezone issue"

# Updating documentation
git commit -m "docs: update README with API documentation"

# Styling changes
git commit -m "style: improve form layout spacing"

# Refactoring code
git commit -m "refactor: extract validation logic to utility"
\`\`\`

### Creating a Feature Branch

\`\`\`bash
# Create and switch to feature branch
git checkout -b feature/add-validation

# Make changes and commit
git add .
git commit -m "feat: add form validation"

# Push to remote
git push origin feature/add-validation

# Create pull request on GitHub
\`\`\`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes and commit following conventions
3. Push to your fork/branch
4. Create a Pull Request with description
5. Request code review from team members
6. Address review feedback
7. Merge after approval

---

## Deployment

### Vercel (Recommended)

The application is configured for seamless deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect Next.js configuration
3. Deploy with zero configuration

### Manual Deployment

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

---

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| npm run dev     | Start development server   |
| npm run build   | Build for production       |
| npm start       | Start production server    |
| npm run lint    | Run ESLint                 |

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`
4. **Make** your changes
5. **Commit** using conventional commits
   \`\`\`bash
   git commit -m "feat: add your feature"
   \`\`\`
6. **Push** to your fork
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`
7. **Open** a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Rohit Rana**
- GitHub: [@ROHIT3496484](https://github.com/ROHIT3496484)

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- [Vercel](https://vercel.com/) - Platform for deployment
