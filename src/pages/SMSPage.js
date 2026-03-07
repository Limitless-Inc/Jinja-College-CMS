import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function SMS({ user }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('custom');
  const [sending, setSending] = useState(false);

  const templates = {
    absence: 'Dear Parent, [Student] was marked absent today at Jinja College. Please contact the school.',
    red: 'URGENT: Dear Parent, your child [Student]\'s attendance has fallen below 70%. Please contact the school urgently.',
    performance: 'Dear Parent, [Student]\'s current attendance and participation need improvement. Please discuss with your child.',
    custom: ''
  };

  useEffect(() => {
    if (user.class_assigned) {
      loadStudents();
    }
  }, [user.class_assigned]);

  const loadStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('class', user.class_assigned)
      .order('name');
    setStudents(data || []);
  };

  const toggleStudent = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(students.map(s => s.id));
  };

  const selectNone = () => {
    setSelected([]);
  };

  const selectRed = () => {
    setSelected(students.filter(s => s.category === 'red').map(s => s.id));
  };

  const handleTemplateChange = (temp) => {
    setTemplate(temp);
    setMessage(templates[temp]);
  };

  const handleSend = async () => {
    if (selected.length === 0) {
      alert('⚠️ Please select at least one student');
      return;
    }
    if (!message.trim()) {
      alert('⚠️ Please enter a message');
      return;
    }

    setSending(true);
    try {
      for (const studentId of selected) {
        const student = students.find(s => s.id === studentId);
        const personalizedMessage = message.replace('[Student]', student.name);
        
        await supabase.from('sms_logs').insert({
          teacher_id: user.id,
          teacher_name: user.name,
          student_id: student.id,
          student_name: student.name,
          parent_phone: student.parent_phone,
          message: personalizedMessage,
          status: 'sent'
        });
      }
      alert(`✅ SMS sent to ${selected.length} parent(s) successfully!`);
      setSelected([]);
      setMessage('');
      setTemplate('custom');
    } catch (error) {
      alert('❌ Error sending SMS');
    }
    setSending(false);
  };

  if (!user.class_assigned) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-gray)' }}>
        You need to be assigned a class to send SMS.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <MessageSquare size={28} style={{ color: 'var(--primary)' }} />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Send SMS - {user.class_assigned}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Select Recipients</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={selectAll} style={{ fontSize: '13px', padding: '6px 12px' }}>Select All</button>
            <button className="btn-secondary" onClick={selectNone} style={{ fontSize: '13px', padding: '6px 12px' }}>Select None</button>
            <button className="btn-secondary" onClick={selectRed} style={{ fontSize: '13px', padding: '6px 12px', background: '#fee2e2', color: '#dc2626' }}>Red Students Only</button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
            {students.map(student => (
              <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer', borderRadius: '4px', background: selected.includes(student.id) ? '#f0f9ff' : 'transparent' }}>
                <input type="checkbox" checked={selected.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '2px' }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>{student.parent_phone}</div>
                </div>
                <span className="badge" style={{ background: student.category === 'red' ? '#ef4444' : student.category === 'orange' ? '#f59e0b' : '#10b981', color: 'white', fontSize: '11px' }}>
                  {student.category.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-gray)' }}>
            Selected: {selected.length} of {students.length} students
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Compose Message</h3>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Template</label>
            <select className="form-input" value={template} onChange={(e) => handleTemplateChange(e.target.value)}>
              <option value="custom">Custom Message</option>
              <option value="absence">Absence Alert</option>
              <option value="red">Red Alert</option>
              <option value="performance">Performance Update</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Message</label>
            <textarea className="form-input" rows="8" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here... Use [Student] to insert student name" />
            <div style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '4px' }}>
              Characters: {message.length}/160 • Use [Student] for student name
            </div>
          </div>
          <button className="btn-primary" onClick={handleSend} disabled={sending || selected.length === 0 || !message.trim()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Send size={18} />
            {sending ? 'Sending...' : `Send SMS to ${selected.length} Parent(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
