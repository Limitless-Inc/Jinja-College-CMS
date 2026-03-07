import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function MyClass({ user }) {
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    green: 0,
    orange: 0,
    red: 0
  });
  const [redStudents, setRedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.class_assigned) {
      loadStats();
    }
  }, [user.class_assigned]);

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('class', user.class_assigned);
    
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('attendance_date', today)
      .eq('class_name', user.class_assigned);
    
    const present = attendance?.filter(a => a.status === 'present').length || 0;
    const absent = attendance?.filter(a => a.status === 'absent').length || 0;
    const late = attendance?.filter(a => a.status === 'late').length || 0;
    
    const green = students?.filter(s => s.category === 'green').length || 0;
    const orange = students?.filter(s => s.category === 'orange').length || 0;
    const red = students?.filter(s => s.category === 'red').length || 0;
    
    const redList = students?.filter(s => s.category === 'red') || [];
    
    setStats({
      total: students?.length || 0,
      present,
      absent,
      late,
      green,
      orange,
      red
    });
    setRedStudents(redList);
    setLoading(false);
  };

  if (!user.class_assigned) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-gray)' }}>
        You need to be assigned a class to view this page.
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
        My Class - {user.class_assigned}
      </h2>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <UserCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.present}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <UserX size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.absent}</h3>
            <p>Absent Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.late}</h3>
            <p>Late Today</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: '#d1fae5', borderColor: '#10b981' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>{stats.green}</div>
          <div style={{ fontSize: '14px', color: '#065f46' }}>🟢 Green Students (90%+)</div>
        </div>
        <div className="card" style={{ background: '#fed7aa', borderColor: '#f59e0b' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>{stats.orange}</div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>🟠 Orange Students (70-89%)</div>
        </div>
        <div className="card" style={{ background: '#fee2e2', borderColor: '#ef4444' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>{stats.red}</div>
          <div style={{ fontSize: '14px', color: '#991b1b' }}>🔴 Red Students (Below 70%)</div>
        </div>
      </div>

      {stats.red > 0 && (
        <div className="card" style={{ borderColor: '#ef4444', borderWidth: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>
              Red Students Needing Attention
            </h3>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {redStudents.map(student => (
              <div key={student.id} style={{ padding: '12px', background: '#fef2f2', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{student.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Parent: {student.parent_phone}</div>
                </div>
                <span className="badge" style={{ background: '#ef4444', color: 'white' }}>RED</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
