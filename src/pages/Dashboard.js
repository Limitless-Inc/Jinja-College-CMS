import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: students } = await supabase.from('students').select('*');
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      const present = attendance?.filter(a => a.status === 'present').length || 0;
      const absent = attendance?.filter(a => a.status === 'absent').length || 0;
      const late = attendance?.filter(a => a.status === 'late').length || 0;
      const total = students?.length || 0;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;

      setStats({
        totalStudents: total,
        presentToday: present,
        absentToday: absent,
        lateToday: late,
        attendanceRate: rate
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
        Welcome back, {user.name}!
      </h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <UserCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.presentToday}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <UserX size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.absentToday}</h3>
            <p>Absent Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.lateToday}</h3>
            <p>Late Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      </div>

      {user.class_assigned && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          marginTop: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
            Your Class: {user.class_assigned}
          </h3>
          <p style={{ color: 'var(--text-gray)' }}>
            You are the class teacher for {user.class_assigned}. Use the sidebar to mark attendance and send SMS to parents.
          </p>
        </div>
      )}
    </div>
  );
}
