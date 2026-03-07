import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FileText, Calendar } from 'lucide-react';

export default function MyReports({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('lesson_reports')
      .select('*')
      .eq('teacher_id', user.id)
      .order('report_date', { ascending: false });
    setReports(data || []);
    setLoading(false);
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileText size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>My Lesson Reports</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
          No reports submitted yet. Submit your first lesson report!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {reports.map(report => (
            <div key={report.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{report.student_name}</h3>
                  <div style={{ fontSize: '14px', color: 'var(--text-gray)' }}>{report.class_name} • {report.subject}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-gray)' }}>
                  <Calendar size={16} />
                  {new Date(report.report_date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{report.lesson_notes}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Participation:</span>
                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', background: getParticipationColor(report.participation) + '20', color: getParticipationColor(report.participation) }}>
                  {report.participation}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
