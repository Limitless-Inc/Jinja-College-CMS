import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FileText, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function ClassReports({ user }) {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [reportsRes, studentsRes] = await Promise.all([
      supabase.from('lesson_reports').select('*').eq('class_name', user.class_assigned).order('report_date', { ascending: false }),
      supabase.from('students').select('*').eq('class_name', user.class_assigned)
    ]);
    setReports(reportsRes.data || []);
    setStudents(studentsRes.data || []);
    setLoading(false);
  };

  const calculateAttendance = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 0;
    const { data } = supabase.from('attendance').select('*').eq('student_id', studentId);
    return 85; // Placeholder
  };

  const getRedStudents = () => {
    return students.filter(s => calculateAttendance(s.id) < 70);
  };

  const submitToDutyHead = async () => {
    if (!summary.trim()) {
      setMessage('Please add a class summary before submitting');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('stream_reports').insert({
      teacher_id: user.id,
      teacher_name: user.name,
      class_name: user.class_assigned,
      summary: summary,
      total_reports: reports.length,
      red_students: getRedStudents().length,
      report_date: new Date().toISOString().split('T')[0],
      status: 'submitted'
    });

    setSubmitting(false);
    if (error) {
      setMessage('Error submitting report');
    } else {
      setMessage('Report submitted to Duty Head successfully!');
      setSummary('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const groupBySubject = () => {
    const grouped = {};
    reports.forEach(r => {
      if (!grouped[r.subject]) grouped[r.subject] = [];
      grouped[r.subject].push(r);
    });
    return grouped;
  };

  const getParticipationColor = (rating) => {
    switch(rating) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Fair': return '#f59e0b';
      case 'Poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  const subjectGroups = groupBySubject();
  const redStudents = getRedStudents();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileText size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Class Reports - {user.class_assigned}</h1>
      </div>

      {message && (
        <div style={{ padding: '12px', background: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24', borderRadius: '8px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <FileText size={24} style={{ color: '#1e40af' }} />
          </div>
          <div>
            <div className="stat-value">{reports.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle size={24} style={{ color: '#16a34a' }} />
          </div>
          <div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <AlertCircle size={24} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <div className="stat-value">{redStudents.length}</div>
            <div className="stat-label">Red Students</div>
          </div>
        </div>
      </div>

      {redStudents.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#dc2626' }}>🔴 Students Needing Attention</h3>
          {redStudents.map(s => (
            <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid #fecaca' }}>
              <div style={{ fontWeight: '500' }}>{s.full_name}</div>
              <div style={{ fontSize: '13px', color: '#991b1b' }}>Parent: {s.parent_phone}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Lesson Reports by Subject</h3>
        {Object.keys(subjectGroups).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-gray)' }}>No lesson reports received yet</div>
        ) : (
          Object.entries(subjectGroups).map(([subject, subjectReports]) => (
            <div key={subject} style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>{subject} ({subjectReports.length} reports)</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {subjectReports.slice(0, 3).map(r => (
                  <div key={r.id} style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{r.student_name}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: getParticipationColor(r.participation) + '20', color: getParticipationColor(r.participation) }}>
                        {r.participation}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>{r.lesson_notes.substring(0, 100)}...</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Weekly Summary & Submit to Duty Head</h3>
        <textarea className="form-input" rows="6" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Add your class summary, observations, and recommendations for this week..." />
        <button onClick={submitToDutyHead} disabled={submitting} className="btn-primary" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Submit to Duty Head'}
        </button>
      </div>
    </div>
  );
}
