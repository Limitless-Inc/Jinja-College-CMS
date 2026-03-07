import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FileText, Download, Eye, AlertCircle, TrendingUp, Search } from 'lucide-react';

export default function AllReports() {
  const [consolidatedReports, setConsolidatedReports] = useState([]);
  const [streamReports, setStreamReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState('consolidated');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [consolidatedRes, streamRes, studentsRes] = await Promise.all([
      supabase.from('consolidated_reports').select('*').order('week_start', { ascending: false }),
      supabase.from('stream_reports').select('*').order('report_date', { ascending: false }),
      supabase.from('students').select('*')
    ]);
    setConsolidatedReports(consolidatedRes.data || []);
    setStreamReports(streamRes.data || []);
    setStudents(studentsRes.data || []);
    setLoading(false);
  };

  const getRedStudents = () => {
    return students.filter(s => (s.attendance_percentage || 0) < 70);
  };

  const exportExcel = (data, filename) => {
    let csv = '';
    if (Array.isArray(data)) {
      csv = [
        ['Admission No', 'Name', 'Class', 'Attendance', 'Parent Phone'].join(','),
        ...data.map(s => [s.admission_no, s.full_name, s.class_name, (s.attendance_percentage || 0) + '%', s.parent_phone].join(','))
      ].join('\n');
    } else {
      csv = `Report: ${data.duty_head_name || data.teacher_name}\nDate: ${data.week_start || data.report_date}\nNotes: ${data.consolidated_notes || data.summary}`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredConsolidated = consolidatedReports.filter(r => {
    const matchesSearch = !searchTerm || r.duty_head_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrom = !dateFrom || new Date(r.week_start) >= new Date(dateFrom);
    const matchesTo = !dateTo || new Date(r.week_start) <= new Date(dateTo);
    return matchesSearch && matchesFrom && matchesTo;
  });

  const filteredStream = streamReports.filter(r => {
    const matchesSearch = !searchTerm || r.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFrom = !dateFrom || new Date(r.report_date) >= new Date(dateFrom);
    const matchesTo = !dateTo || new Date(r.report_date) <= new Date(dateTo);
    return matchesSearch && matchesFrom && matchesTo;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading reports...</div>;

  const redStudents = getRedStudents();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button className={viewMode === 'consolidated' ? 'btn-primary' : 'btn-secondary'} onClick={() => setViewMode('consolidated')} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500' }}>
            Consolidated Reports
          </button>
          <button className={viewMode === 'stream' ? 'btn-primary' : 'btn-secondary'} onClick={() => setViewMode('stream')} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500' }}>
            Stream Reports
          </button>
          <button className={viewMode === 'attention' ? 'btn-primary' : 'btn-secondary'} onClick={() => setViewMode('attention')} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500' }}>
            Students Needing Attention
          </button>
        </div>
        
        {viewMode !== 'attention' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
              <input type="text" className="form-input" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '40px' }} />
            </div>
            <input type="date" className="form-input" placeholder="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: '150px' }} />
            <input type="date" className="form-input" placeholder="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ width: '150px' }} />
          </div>
        )}
      </div>

      {viewMode === 'consolidated' && (
        <div>
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <FileText size={24} style={{ color: '#1e40af' }} />
              </div>
              <div>
                <div className="stat-value">{consolidatedReports.length}</div>
                <div className="stat-label">Weekly Reports</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7' }}>
                <TrendingUp size={24} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <div className="stat-value">{streamReports.length}</div>
                <div className="stat-label">Stream Reports</div>
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

          {filteredConsolidated.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-gray)' }}>
              <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No consolidated reports found</div>
              <div style={{ fontSize: '14px' }}>Try adjusting your filters</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredConsolidated.map(report => (
                <div key={report.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                        Week of {new Date(report.week_start).toLocaleDateString()}
                      </h3>
                      <div style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                        Submitted by: {report.duty_head_name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setSelectedReport(report)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={16} /> View
                      </button>
                      <button onClick={() => exportExcel(report, 'consolidated_report')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={16} /> Excel
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-gray)' }}>Stream Reports: </span>
                      <span style={{ fontWeight: '600' }}>{report.total_stream_reports}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-gray)' }}>Red Students: </span>
                      <span style={{ fontWeight: '600', color: '#dc2626' }}>{report.total_red_students}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6' }}>
                    {report.consolidated_notes.substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'stream' && (
        <div>
          {filteredStream.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-gray)' }}>
              <FileText size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No stream reports found</div>
              <div style={{ fontSize: '14px' }}>Try adjusting your filters</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredStream.map(report => (
                <div key={report.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>{report.class_name}</h3>
                      <div style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                        Teacher: {report.teacher_name} • {new Date(report.report_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => exportExcel(report, 'stream_report')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={16} /> Excel
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-gray)' }}>Total Reports: </span>
                      <span style={{ fontWeight: '600' }}>{report.total_reports}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-gray)' }}>Red Students: </span>
                      <span style={{ fontWeight: '600', color: '#dc2626' }}>{report.red_students}</span>
                    </div>
                  </div>
                  <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6' }}>
                    {report.summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'attention' && (
        <div>
          <div className="card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              🔴 Red Students (Attendance Below 70%)
            </h3>
            {redStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-gray)' }}>
                <AlertCircle size={48} style={{ color: '#d1d5db', margin: '0 auto 16px' }} />
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No red students at this time</div>
                <div style={{ fontSize: '14px' }}>Students with attendance below 70% will appear here</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <button onClick={() => exportExcel(redStudents, 'red_students')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={16} /> Export Red Students List
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Admission No</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Attendance</th>
                      <th>Parent Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redStudents.map(student => (
                      <tr key={student.id}>
                        <td>{student.admission_no}</td>
                        <td>{student.full_name}</td>
                        <td>{student.class_name}</td>
                        <td><span style={{ color: '#dc2626', fontWeight: '600' }}>{student.attendance_percentage || 0}%</span></td>
                        <td>{student.parent_phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
              Consolidated Report - Week of {new Date(selectedReport.week_start).toLocaleDateString()}
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-gray)', marginBottom: '4px' }}>Submitted by:</div>
              <div style={{ fontWeight: '600' }}>{selectedReport.duty_head_name}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Stream Reports</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary)' }}>{selectedReport.total_stream_reports}</div>
              </div>
              <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Red Students</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626' }}>{selectedReport.total_red_students}</div>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Consolidated Notes:</div>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {selectedReport.consolidated_notes}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => exportExcel(selectedReport, 'consolidated_report')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> Export as Excel
              </button>
              <button onClick={() => setSelectedReport(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
