# 📐 REPORTING SYSTEM ARCHITECTURE DIAGRAM

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     JINJA COLLEGE CMS                                │
│                   REPORTING SYSTEM ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  LEVEL 4: ADMIN                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  AllReports.js                                              │    │
│  │  • View consolidated weekly reports                         │    │
│  │  • View all stream reports                                  │    │
│  │  • View red students list                                   │    │
│  │  • Export as PDF/Excel                                      │    │
│  │  • Complete school visibility                               │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                        ┌───────────┴───────────┐
                        │ consolidated_reports  │
                        │ (Database Table)      │
                        └───────────┬───────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│  LEVEL 3: DUTY HEAD                                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  DutyDashboard.js                                           │    │
│  │  • Track report collection status                           │    │
│  │  • View all stream reports                                  │    │
│  │  • Add consolidated notes                                   │    │
│  │  • Submit to Admin                                          │    │
│  │  • School-wide summary                                      │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                        ┌───────────┴───────────┐
                        │   stream_reports      │
                        │   (Database Table)    │
                        └───────────┬───────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│  LEVEL 2: CLASS TEACHERS                                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  ClassReports.js                                            │    │
│  │  • View lesson reports for their stream                     │    │
│  │  • Identify red students                                    │    │
│  │  • Add weekly summary                                       │    │
│  │  • Submit to Duty Head                                      │    │
│  │  • Stream-level oversight                                   │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                        ┌───────────┴───────────┐
                        │   lesson_reports      │
                        │   (Database Table)    │
                        └───────────┬───────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│  LEVEL 1: SUBJECT TEACHERS                                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  SubmitReport.js          MyReports.js                      │    │
│  │  • Submit lesson reports  • View own reports                │    │
│  │  • Rate participation     • Track submissions               │    │
│  │  • Add lesson notes       • Review history                  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATABASE TABLES                               │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   lesson_reports        │
├─────────────────────────┤
│ id (PK)                 │
│ teacher_id (FK)         │───┐
│ teacher_name            │   │
│ student_id (FK)         │───┼───┐
│ student_name            │   │   │
│ class_name              │   │   │
│ subject                 │   │   │
│ lesson_notes            │   │   │
│ participation           │   │   │
│ report_date             │   │   │
│ created_at              │   │   │
└─────────────────────────┘   │   │
                              │   │
┌─────────────────────────┐   │   │
│   stream_reports        │   │   │
├─────────────────────────┤   │   │
│ id (PK)                 │   │   │
│ teacher_id (FK)         │───┘   │
│ teacher_name            │       │
│ class_name              │       │
│ summary                 │       │
│ total_reports           │       │
│ red_students            │       │
│ report_date             │       │
│ status                  │       │
│ created_at              │       │
└─────────────────────────┘       │
                                  │
┌─────────────────────────┐       │
│ consolidated_reports    │       │
├─────────────────────────┤       │
│ id (PK)                 │       │
│ duty_head_id (FK)       │───┐   │
│ duty_head_name          │   │   │
│ week_start              │   │   │
│ total_stream_reports    │   │   │
│ total_red_students      │   │   │
│ consolidated_notes      │   │   │
│ status                  │   │   │
│ created_at              │   │   │
└─────────────────────────┘   │   │
                              │   │
┌─────────────────────────┐   │   │
│      sms_logs           │   │   │
├─────────────────────────┤   │   │
│ id (PK)                 │   │   │
│ teacher_id (FK)         │───┘   │
│ teacher_name            │       │
│ student_id (FK)         │───────┘
│ student_name            │
│ parent_phone            │
│ message                 │
│ status                  │
│ sent_date               │
└─────────────────────────┘

┌─────────────────────────┐
│      attendance         │
├─────────────────────────┤
│ id (PK)                 │
│ student_id (FK)         │───┐
│ student_name            │   │
│ class_name              │   │
│ attendance_date         │   │
│ status                  │   │
│ marked_by (FK)          │───┼───┐
│ marked_by_name          │   │   │
│ created_at              │   │   │
└─────────────────────────┘   │   │
                              │   │
┌─────────────────────────┐   │   │
│       students          │   │   │
├─────────────────────────┤   │   │
│ id (PK)                 │◄──┘   │
│ admission_no            │       │
│ full_name               │       │
│ gender                  │       │
│ class_name              │       │
│ parent_name             │       │
│ parent_phone            │       │
│ date_of_birth           │       │
│ notes                   │       │
│ created_at              │       │
└─────────────────────────┘       │
                                  │
┌─────────────────────────┐       │
│       teachers          │       │
├─────────────────────────┤       │
│ id (PK)                 │◄──────┘
│ staff_id                │
│ name                    │
│ phone                   │
│ subjects                │
│ password                │
│ role                    │
│ approved                │
│ class_assigned          │
│ created_at              │
└─────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                     │
└──────────────────────────────────────────────────────────────────────┘

STEP 1: LESSON REPORT SUBMISSION
─────────────────────────────────
Subject Teacher                    Database
     │                                │
     │  Submit Report Form            │
     │  • Student: Akena Peter        │
     │  • Subject: Mathematics        │
     │  • Notes: "Good participation" │
     │  • Rating: Good                │
     │                                │
     ├───────────────────────────────►│
     │  INSERT INTO lesson_reports    │
     │                                │
     │◄───────────────────────────────┤
     │  Success: Report saved         │
     │                                │


STEP 2: STREAM REPORT CONSOLIDATION
────────────────────────────────────
Class Teacher                      Database
     │                                │
     │  View Class Reports            │
     │                                │
     │◄───────────────────────────────┤
     │  SELECT * FROM lesson_reports  │
     │  WHERE class_name = 'S.1 East' │
     │                                │
     │  Add Weekly Summary            │
     │  "Good week, 85% attendance"   │
     │                                │
     ├───────────────────────────────►│
     │  INSERT INTO stream_reports    │
     │                                │
     │◄───────────────────────────────┤
     │  Success: Submitted to Duty    │
     │                                │


STEP 3: CONSOLIDATED REPORT
────────────────────────────
Duty Head                          Database
     │                                │
     │  View Duty Dashboard           │
     │                                │
     │◄───────────────────────────────┤
     │  SELECT * FROM stream_reports  │
     │  WHERE status = 'submitted'    │
     │                                │
     │  Add Consolidated Notes        │
     │  "School attendance: 87%"      │
     │                                │
     ├───────────────────────────────►│
     │  INSERT INTO                   │
     │  consolidated_reports          │
     │                                │
     │◄───────────────────────────────┤
     │  Success: Submitted to Admin   │
     │                                │


STEP 4: ADMIN REVIEW
────────────────────
Admin                              Database
     │                                │
     │  View All Reports              │
     │                                │
     │◄───────────────────────────────┤
     │  SELECT * FROM                 │
     │  consolidated_reports          │
     │                                │
     │  Click "View Details"          │
     │                                │
     │◄───────────────────────────────┤
     │  Full report with all data     │
     │                                │
     │  Click "Export PDF"            │
     │                                │
     ├───────────────────────────────►│
     │  Generate PDF                  │
     │                                │
     │◄───────────────────────────────┤
     │  Download: weekly_report.pdf   │
     │                                │
```

## 🎭 User Role Matrix

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FEATURE ACCESS BY ROLE                             │
└──────────────────────────────────────────────────────────────────────┘

Feature                    │ Subject │ Class   │ Duty  │ Admin │
                          │ Teacher │ Teacher │ Head  │       │
──────────────────────────┼─────────┼─────────┼───────┼───────┤
Submit Report             │    ✅   │    ✅   │   ✅  │   ❌  │
My Reports                │    ✅   │    ✅   │   ✅  │   ❌  │
Class Reports             │    ❌   │    ✅   │   ❌  │   ❌  │
Duty Dashboard            │    ❌   │    ❌   │   ✅  │   ❌  │
All Reports               │    ❌   │    ❌   │   ❌  │   ✅  │
Export Reports            │    ❌   │    ✅*  │   ✅* │   ✅  │
View Red Students         │    ❌   │    ✅*  │   ✅  │   ✅  │
Send SMS                  │    ❌   │    ✅   │   ❌  │   ✅  │
──────────────────────────┴─────────┴─────────┴───────┴───────┘

* Class Teacher: Only their stream
* Duty Head: All streams during duty period
```

## 📱 Page Navigation Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                      SIDEBAR NAVIGATION                               │
└──────────────────────────────────────────────────────────────────────┘

ADMIN SIDEBAR                    TEACHER SIDEBAR
─────────────                    ───────────────
├─ Dashboard                     ├─ Dashboard
├─ Students                      ├─ View Students
├─ Teachers                      ├─ Submit Report ◄─── NEW
├─ Classes                       ├─ My Reports ◄────── NEW
├─ Duty Management               │
├─ All Reports ◄────── NEW       ├─ [IF class_assigned:]
├─ Settings                      │  ├─ My Class
└─ Logout                        │  ├─ Attendance
                                 │  ├─ Send SMS
                                 │  └─ Class Reports ◄─ NEW
                                 │
                                 ├─ [IF on_duty:]
                                 │  └─ Duty Dashboard ◄ NEW
                                 │
                                 └─ Logout
```

## 🔐 Security & Permissions

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY (RLS)                           │
└──────────────────────────────────────────────────────────────────────┘

Table: lesson_reports
─────────────────────
Policy: Teachers can INSERT their own reports
Policy: Teachers can SELECT their own reports
Policy: Class teachers can SELECT reports for their class
Policy: Duty head can SELECT all reports
Policy: Admin can SELECT all reports

Table: stream_reports
─────────────────────
Policy: Class teachers can INSERT for their class
Policy: Duty head can SELECT all reports
Policy: Admin can SELECT all reports

Table: consolidated_reports
───────────────────────────
Policy: Duty head can INSERT
Policy: Admin can SELECT all reports

Table: sms_logs
───────────────
Policy: Teachers can INSERT
Policy: Teachers can SELECT their own logs
Policy: Admin can SELECT all logs

Table: attendance
─────────────────
Policy: Teachers can INSERT/UPDATE
Policy: Teachers can SELECT for their class
Policy: Admin can SELECT all records
```

## 📊 Report Generation Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    WEEKLY REPORT CYCLE                                │
└──────────────────────────────────────────────────────────────────────┘

MONDAY - THURSDAY
─────────────────
Subject Teachers submit daily lesson reports
    ↓
Reports accumulate in lesson_reports table
    ↓
Class Teachers monitor their stream reports

FRIDAY
──────
Class Teachers consolidate weekly reports
    ↓
Add summary and identify red students
    ↓
Submit to Duty Head (stream_reports table)

SATURDAY
────────
Duty Head reviews all stream reports
    ↓
Consolidates into school-wide report
    ↓
Adds recommendations and issues
    ↓
Submits to Admin (consolidated_reports table)

SUNDAY
──────
Admin reviews consolidated report
    ↓
Exports as PDF/Excel
    ↓
Shares with school director
    ↓
Plans action items for next week

CYCLE REPEATS
```

## 🎯 System Integration Points

```
┌──────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                              │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  CMS Frontend   │
│  (React App)    │
└────────┬────────┘
         │
         │ Supabase Client
         │
         ▼
┌─────────────────┐
│   Supabase      │
│   (Database)    │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌─────────────┐
│ SMS API     │  │ Email API   │
│ (Future)    │  │ (Future)    │
│             │  │             │
│ • Twilio    │  │ • SendGrid  │
│ • Africa's  │  │ • AWS SES   │
│   Talking   │  │             │
└─────────────┘  └─────────────┘
         │              │
         ▼              ▼
┌─────────────────────────────┐
│      Parents/Staff          │
│   (SMS/Email Recipients)    │
└─────────────────────────────┘
```

---

**This architecture supports:**
- ✅ Scalability (1000+ students, 100+ teachers)
- ✅ Security (RLS policies, role-based access)
- ✅ Performance (indexed queries, optimized flow)
- ✅ Maintainability (clear separation of concerns)
- ✅ Extensibility (easy to add features)
