import React, { useState, useEffect } from 'react';
import { Calendar, Save, Check } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Attendance({ user }) {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user.class_assigned) {
      loadStudents();
      loadAttendance();
    }
  }, [date, user.class_assigned]);

  const loadStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('class', user.class_assigned)
      .order('name');
    setStudents(data || []);
  };

  const loadAttendance = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('attendance_date', date)
      .eq('class_name', user.class_assigned);
    
    const attendanceMap = {};
    data?.forEach(record => {
      attendanceMap[record.student_id] = record.status;
    });
    setAttendance(attendanceMap);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(s => allPresent[s.id] = 'present');
    setAttendance(allPresent);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const student of students) {
        const status = attendance[student.id] || 'absent';
        
        const { data: existing } = await supabase
          .from('attendance')
          .select('id')
          .eq('student_id', student.id)
          .eq('attendance_date', date)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('attendance')
            .update({ 
              status, 
              marked_by: user.id,
              marked_by_name: user.name
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('attendance')
            .insert({
              student_id: student.id,
              student_name: student.name,
              class_name: user.class_assigned,
              attendance_date: date,
              status,
              marked_by: user.id,
              marked_by_name: user.name
            });
        }
      }
      alert('✅ Attendance saved successfully!');
      loadAttendance();
    } catch (error) {
      alert('❌ Error saving attendance');
    }
    setSaving(false);
  };

  if (!user.class_assigned) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-gray)' }}>
        You need to be assigned a class to mark attendance.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Mark Attendance - {user.class_assigned}</h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'end' }}>
        <div>
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '180px' }}
          />
        </div>
        <button className="btn-secondary" onClick={markAllPresent} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={16} /> Mark All Present
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th style={{ textAlign: 'center' }}>Present</th>
              <th style={{ textAlign: 'center' }}>Absent</th>
              <th style={{ textAlign: 'center' }}>Late</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                  No students found in {user.class_assigned}
                </td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '600' }}>{student.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={attendance[student.id] === 'present'}
                      onChange={() => handleStatusChange(student.id, 'present')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={attendance[student.id] === 'absent'}
                      onChange={() => handleStatusChange(student.id, 'absent')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={attendance[student.id] === 'late'}
                      onChange={() => handleStatusChange(student.id, 'late')}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
