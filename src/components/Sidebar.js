import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ClipboardList, 
  MessageSquare, 
  Calendar,
  FileText,
  Settings,
  Menu,
  LogOut
} from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Sidebar({ collapsed, setCollapsed, activeTab, setActiveTab, user, onLogout }) {
  const [hasDuty, setHasDuty] = useState(false);
  const [isDutyHead, setIsDutyHead] = useState(false);

  useEffect(() => {
    if (user.role !== 'admin') {
      checkDutyStatus();
    }
  }, [user]);

  const checkDutyStatus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('duty_assignments')
      .select('is_duty_head')
      .eq('teacher_id', user.id)
      .eq('status', 'active')
      .lte('start_date', today)
      .gte('end_date', today)
      .single();
    
    if (data) {
      setHasDuty(true);
      setIsDutyHead(data.is_duty_head);
    } else {
      setHasDuty(false);
      setIsDutyHead(false);
    }
  };

  const baseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  const teacherOnlyItems = user.role !== 'admin' ? [
    { id: 'students', label: 'View Students', icon: Users },
    { id: 'submit-report', label: 'Submit Report', icon: ClipboardList },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : [];

  const classTeacherItems = user.class_assigned ? [
    { id: 'my-class', label: 'My Class', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'sms', label: 'Send SMS', icon: MessageSquare },
    { id: 'class-reports', label: 'Class Reports', icon: FileText }
  ] : [];

  const dutyItems = hasDuty ? [
    { id: 'duty', label: isDutyHead ? 'Duty Dashboard (HEAD)' : 'Duty Dashboard', icon: ClipboardList }
  ] : [];

  const adminItems = user.role === 'admin' ? [
    { id: 'manage-students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'classes', label: 'Classes', icon: Calendar },
    { id: 'duty-management', label: 'Duty Management', icon: Calendar },
    { id: 'reports', label: 'All Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : [];

  const navItems = user.role === 'admin' 
    ? [...baseNavItems, ...adminItems]
    : [...baseNavItems, ...teacherOnlyItems, ...classTeacherItems, ...dutyItems];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Jinja CMS</div>
        <button className="hamburger-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="nav-item" onClick={onLogout} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <LogOut size={20} className="nav-icon" />
        <span className="nav-text">Logout</span>
      </div>
    </div>
  );
}
