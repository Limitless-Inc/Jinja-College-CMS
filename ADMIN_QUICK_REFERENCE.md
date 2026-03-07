# 🎯 QUICK REFERENCE: ADMIN ACTIONS → TEACHER FEATURES

## 📌 THE GOLDEN RULE

> **Teachers start with BASE features. Admin ADDS features by making assignments.**

---

## 🔑 BASE FEATURES (Every Teacher Has These)

✅ Dashboard  
✅ View Students (read-only)  
✅ Submit Lesson Report  
✅ My Reports  

**These NEVER disappear, even with no assignments.**

---

## 📚 CLASS TEACHER FEATURES (Admin Assigns Class)

### How Admin Assigns:
1. Teachers page → Edit teacher
2. Select class from dropdown
3. Save

### What Teacher Gets:
✅ My Class (class dashboard)  
✅ Attendance (mark students)  
✅ Send SMS (to parents)  
✅ Class Reports (view reports)  

### When Features Appear:
- Immediately on next login
- Teacher must log out and back in

### When Features Disappear:
- Admin removes class assignment
- Teacher logs out and back in

---

## 🟡 DUTY TEACHER FEATURES (Admin Assigns Duty)

### How Admin Assigns:
1. Duty Management → Assign New Duty Team
2. Select teachers (up to 5)
3. Choose Duty Head
4. Set start/end dates
5. Save

### What Regular Duty Teacher Gets:
✅ Duty Dashboard  
- View team members
- Collect reports from class teachers
- Send reminders
- Team communication

### What Duty Head Gets (EXTRA):
✅ Everything above PLUS:  
✅ Consolidate Reports button  
✅ Submit to Admin button  

### When Features Appear:
- Immediately on next login
- Teacher must log out and back in

### When Features Disappear:
- Duty end date passes (auto-expires at midnight)
- OR Admin clicks "End Duty Early"
- Teacher logs out and back in

---

## 🔄 COMBINATION SCENARIOS

### Teacher with Class ONLY
```
Sidebar Shows:
├─ Dashboard
├─ MY CLASS ⬅️
├─ ATTENDANCE ⬅️
├─ SEND SMS ⬅️
├─ CLASS REPORTS ⬅️
├─ View Students
├─ Submit Report
└─ My Reports
```

### Teacher with Duty ONLY
```
Sidebar Shows:
├─ Dashboard
├─ DUTY DASHBOARD ⬅️
├─ View Students
├─ Submit Report
└─ My Reports
```

### Teacher with Class AND Duty
```
Sidebar Shows:
├─ Dashboard
├─ MY CLASS ⬅️
├─ ATTENDANCE ⬅️
├─ SEND SMS ⬅️
├─ CLASS REPORTS ⬅️
├─ DUTY DASHBOARD ⬅️
├─ View Students
├─ Submit Report
└─ My Reports
```

### Teacher with Class AND Duty Head
```
Sidebar Shows:
├─ Dashboard
├─ MY CLASS ⬅️
├─ ATTENDANCE ⬅️
├─ SEND SMS ⬅️
├─ CLASS REPORTS ⬅️
├─ DUTY DASHBOARD (HEAD) ⬅️
├─ View Students
├─ Submit Report
└─ My Reports

MAXIMUM FEATURES!
```

---

## ⚠️ IMPORTANT RULES

### Class Assignment:
- ✅ One class = One teacher
- ❌ Cannot assign same class to multiple teachers
- ✅ Can change class assignment anytime
- ✅ Can remove assignment (set to "No Class Assigned")

### Duty Assignment:
- ✅ Up to 5 teachers per duty team
- ✅ Exactly 1 Duty Head per team
- ✅ Auto-expires on end date
- ✅ Can extend duty period
- ✅ Can end duty early

### Teacher Must:
- 🔄 Log out and back in to see new features
- 🔄 Log out and back in when features removed

---

## 🎬 STEP-BY-STEP EXAMPLES

### Example 1: Make Teacher a Class Teacher

**Starting Point**: Mr. Mukasa has base features only

**Admin Actions**:
1. Go to Teachers page
2. Find Mr. Mukasa
3. Click Edit
4. Select "S.1 East" from Class dropdown
5. Click Update Teacher

**Result**: 
- Database: `teachers.class_assigned = "S.1 East"`
- Mr. Mukasa logs out and back in
- Sidebar now shows: My Class, Attendance, SMS, Class Reports

---

### Example 2: Make Teacher a Duty Head

**Starting Point**: Ms. Atim has base features only

**Admin Actions**:
1. Go to Duty Management
2. Click "Assign New Duty Team"
3. Select Ms. Atim + 2 other teachers
4. Choose Ms. Atim as Duty Head (radio button)
5. Set dates: March 10-17
6. Click Assign Duty Team

**Result**:
- Database: `duty_assignments` record created with `is_duty_head = true`
- Ms. Atim logs out and back in
- Sidebar shows: Duty Dashboard (HEAD)
- Other 2 teachers see: Duty Dashboard (no HEAD label)

---

### Example 3: Remove Class Assignment

**Starting Point**: Mr. Okello is class teacher for S.1 North

**Admin Actions**:
1. Go to Teachers page
2. Find Mr. Okello
3. Click Edit
4. Change Class dropdown to "No Class Assigned"
5. Click Update Teacher

**Result**:
- Database: `teachers.class_assigned = NULL`
- Mr. Okello logs out and back in
- Sidebar hides: My Class, Attendance, SMS, Class Reports
- Returns to base features only

---

### Example 4: Duty Auto-Expires

**Starting Point**: Duty team active until March 17

**What Happens**:
- March 17 11:59 PM: Duty still active
- March 18 12:00 AM: System auto-expires duty
- March 18 morning: Teachers open app
- System runs `expireOldDuties()` function
- Database: `duty_assignments.status = "expired"`
- Teachers log out and back in
- Sidebar hides: Duty Dashboard
- All duty features gone

---

## 🔍 TROUBLESHOOTING

### "Teacher says they don't see new features"
**Solution**: Tell teacher to log out and back in

### "Teacher still sees old features after removal"
**Solution**: Tell teacher to log out and back in

### "Duty features not appearing"
**Check**:
1. Is duty status = "active"?
2. Is today between start_date and end_date?
3. Did teacher log out and back in?

### "Class features not appearing"
**Check**:
1. Is class_assigned field populated?
2. Is class valid (exists in classes table)?
3. Did teacher log out and back in?

---

## 📊 FEATURE MATRIX

| Teacher Has | Base | Class | Duty | Duty Head |
|-------------|------|-------|------|-----------|
| Nothing | ✅ | ❌ | ❌ | ❌ |
| Class only | ✅ | ✅ | ❌ | ❌ |
| Duty only | ✅ | ❌ | ✅ | ❌ |
| Duty Head only | ✅ | ❌ | ✅ | ✅ |
| Class + Duty | ✅ | ✅ | ✅ | ❌ |
| Class + Duty Head | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 ADMIN CHECKLIST

Before assigning features:
- [ ] Class exists in Classes table
- [ ] Class not already assigned to another teacher
- [ ] Teacher account is approved
- [ ] For duty: Selected 1-5 teachers
- [ ] For duty: Designated exactly 1 Duty Head
- [ ] Set valid start and end dates

After assigning features:
- [ ] Told teacher to log out and back in
- [ ] Verified features appear in teacher's sidebar
- [ ] Tested that teacher can access new pages

---

**Remember**: Features are ADDED by assignments, not by changing roles!
