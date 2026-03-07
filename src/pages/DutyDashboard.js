import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FileText, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function DutyDashboard({ user }) {
  const [streamReports, setStreamReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [consolidatedNotes, setConsolidatedNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [reportsRes, classesRes] = await Promise.all([
      supabase.from('stream_reports').select('*').eq('status', 'submitted').order('report_date', { ascending: false }),
      supabase.from('classes').select('*')
    ]);
    setStreamReports(reportsRes.data || []);
    setClasses(classesRes.data || []);
    setLoading(false);
  };

  const getReportStatus = (className) => {
    return streamReports.some(r => r.class_name === className);
  };

  const submitToAdmin = async () => {
    if (!consolidatedNotes.trim()) {
      setMessage('Please add consolidated notes before submitting');
      return;
    }

    setSubmitting(true);
    const totalRedStudents = streamReports.reduce((sum, r) => sum + (r.red_students || 0), 0);
    
    const { error } = await supabase.from('consolidated_reports').insert({
      duty_head_id: user.id,
      duty_head_name: user.name,
      week_start: new Date().toISOString().split('T')[0],
      total_stream_reports: streamReports.length,
      total_red_students: totalRedStudents,
      consolidated_notes: consolidatedNotes,
      status: 'submitted'
    });

    setSubmitting(false);
    if (error) {
      setMessage('Error submitting consolidated report');
    } else {
      setMessage('Consolidated report submitted to Admin successfully!');
      setConsolidatedNotes('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;

  const totalRedStudents = streamReports.reduce((sum, r) => sum + (r.red_students || 0), 0);
  const receivedCount = streamReports.length;
  const pendingCount = classes.length - receivedCount;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileText size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>⭐ Duty Head Dashboard</h1>
      </div>

      {message && (
        <div style={{ padding: '12px', background: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24', borderRadius: '8px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle size={24} style={{ color: '#16a34a' }} />
          </div>
          <div>
            <div className="stat-value">{receivedCount}</div>
            <div className="stat-label">Reports Received</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Clock size={24} style={{ color: '#d97706' }} />
          </div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Reports Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <AlertTriangle size={24} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <div className="stat-value">{totalRedStudents}</div>
            <div className="stat-label">Red Students</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Reports Collection Status</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {classes.map(cls => {
            const hasReport = getReportStatus(cls.name);
            return (
              <div key={cls.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500' }}>Class {cls.name}</span>
                {hasReport ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '14px' }}>
                    <CheckCircle size={16} /> RECEIVED
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontSize: '14px' }}>
                    <Clock size={16} /> PENDING
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Received Stream Reports</h3>
        {streamReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-gray)' }}>No stream reports received yet</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {streamReports.map(report => (
              <div key={report.id} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{report.class_name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Teacher: {report.teacher_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{report.total_reports} reports</div>
                    <div style={{ fontSize: '13px', color: '#dc2626' }}>🔴 {report.red_students} red students</div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'white', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6' }}>
                  {report.summary}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Consolidated Weekly Report</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '16px' }}>
          Add your school-wide summary, issues identified, and recommendations for the Admin.
        </p>
        <textarea className="form-input" rows="8" value={consolidatedNotes} onChange={(e) => setConsolidatedNotes(e.target.value)} placeholder="School-wide summary, attendance trends, issues identified, parent contact summary, recommendations..." />
        <button onClick={submitToAdmin} disabled={submitting || streamReports.length === 0} className="btn-primary" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Submit Consolidated Report to Admin'}
        </button>
        {streamReports.length === 0 && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#d97706' }}>
            ⚠️ Wait for at least one stream report before submitting
          </div>
        )}
      </div>
    </div>
  );
}
