# ScanSolve

ScanSolve is a simple full-stack real-time workshop app built with Next.js App Router, Tailwind CSS, and Supabase.

## Features

- Admin Excel upload using `xlsx`
- Problem storage in Supabase
- QR code generation using `qrcode`
- Random problem assignment for students
- Student answer submission
- Background AI score and short feedback after submission
- Live dashboard with masked student names
- Real-time updates using Supabase subscriptions

## Folder Structure

```text
app/
  admin/page.js
  student/page.js
  dashboard/page.js
  api/
    dashboard/route.js
    problems/upload/route.js
    students/assign/route.js
    submissions/route.js
lib/
  submission-utils.js
  supabase/
    admin.js
    browser.js
supabase/
  schema.sql
.env.example
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AZURE_OPENAI_ENDPOINT=https://tech-mnoei7r2-swedencentral.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-10-21
AZURE_OPENAI_API_KEY=your-azure-openai-key
```

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the SQL from `supabase/schema.sql`.
4. Copy your project URL, anon key, and service role key into `.env.local`.
5. Optionally add Azure OpenAI environment variables for live AI evaluation. If `AZURE_OPENAI_API_KEY` is missing, the app uses a mock evaluator.

## Excel Format

Use the first sheet in your Excel file with columns like:

```text
title | description
```

If those headers are missing, the app falls back to the first two columns.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open:

- `http://localhost:3000/admin`
- `http://localhost:3000/student`
- `http://localhost:3000/dashboard`

## Demo Flow

1. Go to `/admin`.
2. Upload the Excel file with problem statements.
3. Display the generated QR code.
4. Students scan the QR and open `/student`.
5. Students enter their name, email, phone number, and studying year.
6. The app assigns a random problem.
7. Students submit their solution.
8. Watch `/dashboard` update in real time.

## Notes

- The dashboard masks student names as `F***`.
- The dashboard only shows a 50-character answer preview.
- The dashboard now shows AI score and feedback for each submission.
- AI evaluation runs in the background, one queued submission at a time.
- If Azure OpenAI is unavailable or any evaluation step fails, the app falls back to mock scoring.
- Server routes use the Supabase service role key, so keep it private.
