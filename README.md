# Jinja College CMS - Class Monitoring System

A complete desktop application for school management built with React + Electron.

## Features

- **Dynamic User Capabilities**: Teachers get features based on Admin assignments
- **Attendance Tracking**: Mark students present/absent/late daily
- **Parent SMS Communication**: Send notifications to parents
- **Lesson Reporting**: Document what was taught
- **Student Categorization**: Auto-categorize by attendance (Green/Orange/Red)
- **Duty Management**: Weekly rotation with automatic expiry
- **Admin Controls**: Complete oversight and management

## Tech Stack

- **Frontend**: React 18
- **Desktop**: Electron
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React (2px stroke, line-art style)
- **Styling**: Custom CSS with clean institutional design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

The app will open as a desktop window automatically!

## Default Login

For testing, use:
- **Staff ID**: admin
- **Password**: admin

## Design System

- **Primary Color**: Deep Blue (#1e40af)
- **Sidebar**: Dark Navy (#1f2937)
- **Icons**: Lucide line-art icons with 2px stroke
- **Layout**: Two-panel (collapsible sidebar + main content)
- **Typography**: Inter font family

## Project Structure

```
CMS/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Sidebar.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Students.js
│   │   ├── Attendance.js
│   │   └── Teachers.js
│   ├── utils/
│   │   └── supabase.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── electron.js
└── package.json
```

## Building for Production

```bash
npm run build
npm run package
```

## Support

For issues or questions, contact the development team.
