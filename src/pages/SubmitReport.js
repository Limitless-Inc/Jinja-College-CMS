import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { FileText, Send } from 'lucide-react';

export default function SubmitReport({ user }) {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    lesson_notes: '',
    participation: 'Good'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('name');
    setStudents(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.subject || !formData.lesson_notes) {
      setMessage('❌ Please fill all required fields');
      return;
    }

    setLoading(true);
    const student = students.find(s => s.id === parseInt(formData.student_id));
    
    const { error } = await supabase.from('lesson_reports').insert({
      teacher_id: user.id,
      teacher_name: user.name,
      student_id: formData.student_id,
      student_name: student.name,
      class_name: student.class,
      subject: formData.subject,
      lesson_notes: formData.lesson_notes,
      participation: formData.participation,
      report_date: new Date().toISOString().split('T')[0]
    });

    setLoading(false);
    if (error) {
      setMessage('❌ Error submitting report');
    } else {
      setMessage('✅ Report submitted successfully!');
      setFormData({ student_id: '', subject: '', lesson_notes: '', participation: 'Good' });
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <FileText size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Submit Lesson Report</h1>
      </div>

      {message && (
        <div style={{ padding: '12px', background: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24', borderRadius: '8px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label className="form-label">Student *</label>
              <select className="form-input" value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} required>
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.class}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Subject *</label>
              <input className="form-input" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="e.g., Mathematics, Science" required />
            </div>

            <div>
              <label className="form-label">Lesson Notes *</label>
              <textarea className="form-input" rows="5" value={formData.lesson_notes} onChange={(e) => setFormData({...formData, lesson_notes: e.target.value})} placeholder="What was taught, student behavior, homework status..." required />
            </div>

            <div>
              <label className="form-label">Participation Rating *</label>
              <select className="form-input" value={formData.participation} onChange={(e) => setFormData({...formData, participation: e.target.value})}>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <Send size={18} />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
