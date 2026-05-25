# SSOP Monitoring Records Management System

A Supabase-powered React web application for digitizing the SSOP and food safety monitoring records of **Ilocos Food Products**, Taleb, Bantay, Ilocos Sur.

This version does not use PHP, MySQL, phpMyAdmin, XAMPP, or server-side sessions. Authentication, database access, and permissions are handled by Supabase Auth, PostgreSQL, and Row Level Security.

## Features

- Supabase Auth login
- Role-based access:
  - Admin: full access
  - QA Personnel: view records and verify records
  - Inspector: add records and edit records they created
  - Viewer: read-only access
- Responsive dashboard with cards and charts
- CRUD modules for:
  - Stock Management & Control
  - Handling and Receiving of Raw Materials
  - Cleanliness and Maintenance of Delivery Truck
  - Pest Control Monitoring
  - Oil Temperature in Deep Frying / CCP Monitoring Record
  - Cleaning and Sanitation Log Sheet
- Search, date filters, status filters, loading states, alerts, CSV export, print views
- Oil temperature validation:
  - Below 180°C: `Below Range`
  - 180°C to 190°C: `Normal`
  - Above 190°C: `Above Range`
  - Corrective action is required for deviations
- Reports page with summary totals
- User role management through the `profiles` table
- Activity logs for add, edit, delete, verify, print, and export actions
- Mobile-first Tailwind layout with collapsible sidebar and scrollable tables

## Tech Stack

- React + Vite
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Chart.js through `react-chartjs-2`
- Lucide React icons

## Supabase Setup

1. Go to [https://supabase.com](https://supabase.com).
2. Create a new project.
3. Open **SQL Editor**.
4. Copy and run:

```text
supabase/schema.sql
```

5. Go to **Authentication > Providers** and make sure Email authentication is enabled.
6. Create your first user in **Authentication > Users**.
7. After the user exists, open **SQL Editor** and make that user an admin:

```sql
update public.profiles
set role = 'Admin', full_name = 'System Administrator'
where email = 'your-email@example.com';
```

Replace `your-email@example.com` with the email you used.

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the anon public key only. Never place the Supabase service role key in the frontend.

The same variable names are listed in `.env.example`.

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The production files will be generated in:

```text
dist/
```

## Deploy

### Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Environment Variables.
4. Deploy.

### Netlify

1. Push this project to GitHub.
2. Import the repository in Netlify.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add the two Supabase environment variables.
6. Deploy.

### GitHub Pages

1. This app uses `HashRouter`, so GitHub Pages refreshes work with URLs like `https://username.github.io/repository-name/#/dashboard`.
2. Build with `npm run build`.
3. Publish the `dist` folder using your preferred GitHub Pages workflow.

For the easiest deployment, use Vercel or Netlify.

## Folder Structure

```text
ssop-monitoring-system/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── charts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── stock-management/
│   │   ├── raw-materials/
│   │   ├── delivery-truck/
│   │   ├── pest-control/
│   │   ├── oil-temperature/
│   │   ├── cleaning-sanitation/
│   │   ├── reports/
│   │   ├── users/
│   │   └── activity-logs/
│   ├── services/
│   ├── utils/
│   ├── hooks/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/schema.sql
├── .env.example
├── package.json
└── vite.config.js
```

## Assumptions

- Duplicate oil temperature/deep frying files are treated as one module.
- QA verification is stored as a text name in `verified_by_qa`.
- The frontend uses Supabase RLS for authoritative permission enforcement and also hides unauthorized actions in the UI.
- User creation is performed in Supabase Auth. Role assignment is done in the app by Admin users or directly in the `profiles` table for the first admin.
