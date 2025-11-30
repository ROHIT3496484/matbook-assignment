# Form Builder - Employee Onboarding System

A modern, dynamic form builder application for employee onboarding built with Next.js 15, React, and TypeScript.

## Project Description

Form Builder is a full-stack web application that enables organizations to collect employee onboarding information through a dynamic, schema-driven form. The application features a clean, professional UI with real-time validation, submission management, and data export capabilities.

### Key Features

- **Dynamic Form Generation**: Forms are generated from a JSON schema, making it easy to modify fields without code changes
- **Multiple Field Types**: Supports text, email, phone, number, select dropdowns, checkboxes, date pickers, textareas, and toggle switches
- **Real-time Validation**: Client-side validation with error messages for required fields and format validation
- **Submissions Management**: View, sort, and paginate through all form submissions
- **Export to CSV**: Download all submissions as a CSV file for reporting
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Lucide React | Icons |

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── form-schema/      # GET form schema endpoint
│   │   └── submissions/      # CRUD operations for submissions
│   ├── submissions/          # Submissions list page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Form page (home)
├── components/
│   ├── ui/                   # Reusable UI components
│   └── dynamic-form.tsx      # Main form component
├── lib/
│   ├── submissions-store.ts  # In-memory data store
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
\`\`\`

## Form Fields

The Employee Onboarding Form includes:

| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | Yes |
| Email Address | Email | Yes |
| Phone Number | Phone | Yes |
| Age | Number | Yes |
| Department | Select Dropdown | Yes |
| Skills | Multi-checkbox | Yes |
| Start Date | Date Picker | Yes |
| Bio | Textarea | No |
| Remote Work | Toggle Switch | No |

## API Endpoints

### Form Schema
- `GET /api/form-schema` - Retrieve the form configuration

### Submissions
- `GET /api/submissions` - List all submissions (with pagination & sorting)
- `POST /api/submissions` - Create a new submission
- `GET /api/submissions/[id]` - Get a specific submission
- `DELETE /api/submissions/[id]` - Delete a submission

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/form-builder.git
cd form-builder
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Run the development server
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch for feature integration
- `feature/*` - Feature branches (e.g., `feature/add-validation`)
- `bugfix/*` - Bug fix branches (e.g., `bugfix/fix-date-format`)

### Commit Message Convention

Follow conventional commits for clear history:

\`\`\`
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, styling changes
refactor: code restructuring
test: adding tests
chore: maintenance tasks
\`\`\`

### Example Commits

\`\`\`bash
git commit -m "feat: add CSV export functionality"
git commit -m "fix: resolve date picker timezone issue"
git commit -m "docs: update README with API documentation"
git commit -m "style: improve form layout spacing"
\`\`\`

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes and commit
3. Push to your fork
4. Create a Pull Request to `develop`
5. Request code review
6. Merge after approval

## Deployment

The application is deployed on Vercel with automatic deployments on push to `main`.

### Environment Variables

No environment variables are required for basic functionality. The application uses an in-memory store for submissions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Rohit Rana

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons
