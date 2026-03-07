import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Search, Download, User, Key, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { validateClassAssignment, isClassAlreadyAssigned } from '../utils/teacherUtils';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileData, setProfileData] = useState({ reports: 0, duty: [], sms: 0 });
  const [showReject, setShowReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    phone: '',
    subjects: '',
    password: '',
    role: 'teacher',
    class_assigned: ''
  });

  useEffect(() => {
    loadTeachers();
    loadClasses();
  }, []);

  const loadTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*').order('name');
    setTeachers(data || []);
    setLoading(false);
  };

  const loadClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('name');
    setClasses(data || []);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      staff_id: teacher.staff_id,
      name: teacher.name,
      phone: teacher.phone,
      subjects: teacher.subjects,
      password: '',
      role: teacher.role || 'teacher',
      class_assigned: teacher.class_assigned || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate class assignment if provided
      if (formData.class_assigned) {
        const isValid = await validateClassAssignment(formData.class_assigned);
        if (!isValid) {
          alert('❌ Invalid class. Please select a valid class from the dropdown.');
          return;
        }
        
        // Check if class is already assigned to another teacher
        const alreadyAssigned = await isClassAlreadyAssigned(
          formData.class_assigned, 
          editingTeacher?.id
        );
        if (alreadyAssigned) {
          alert('❌ This class is already assigned to another teacher. Each class can only have one class teacher.');
          return;
        }
      }
      
      if (editingTeacher) {
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          subjects: formData.subjects,
          role: formData.role,
          class_assigned: formData.class_assigned || null
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await supabase.from('teachers').update(updateData).eq('id', editingTeacher.id);
        alert('✅ Teacher updated successfully!');
      } else {
        await supabase.from('teachers').insert({
          ...formData,
          class_assigned: formData.class_assigned || null,
          approved: true
        });
        alert('✅ Teacher added successfully!');
      }
      setShowModal(false);
      setEditingTeacher(null);
      loadTeachers();
      setFormData({ staff_id: '', name: '', phone: '', subjects: '', password: '', role: 'teacher', class_assigned: '' });
    } catch (error) {
      alert('❌ Error saving teacher');
    }
  };

  const handleApprove = async (id) => {
    await supabase.from('teachers').update({ approved: true }).eq('id', id);
    loadTeachers();
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    await supabase.from('teachers').update({ approved: false, rejection_reason: rejectReason }).eq('id', id);
    setShowReject(null);
    setRejectReason('');
    loadTeachers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      await supabase.from('teachers').delete().eq('id', id);
      loadTeachers();
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({...formData, password: pwd});
  };

  const viewProfile = async (teacher) => {
    setSelectedProfile(teacher);
    const [repCount, smsCount] = await Promise.all([
      supabase.from('lesson_reports').select('id', { count: 'exact' }).eq('teacher_id', teacher.id),
      supabase.from('sms_logs').select('id', { count: 'exact' }).eq('teacher_id', teacher.id)
    ]);
    setProfileData({ reports: repCount.count || 0, duty: [], sms: smsCount.count || 0 });
    setShowProfile(true);
  };

  const exportToExcel = () => {
    const csv = [
      ['Staff ID', 'Name', 'Phone', 'Subjects', 'Role', 'Class', 'Status'].join(','),
      ...filteredTeachers.map(t => [
        t.staff_id, t.name, t.phone, t.subjects, t.role, t.class_assigned || '-', t.approved ? 'Approved' : 'Pending'
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.staff_id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || t.role === filterRole;
    const matchesStatus = !filterStatus || (filterStatus === 'approved' ? t.approved : !t.approved);
    const matchesClass = !filterClass || t.class_assigned === filterClass;
    return matchesSearch && matchesRole && matchesStatus && matchesClass;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Teacher Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Teacher
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
          <input type="text" className="form-input" placeholder="Search by name or staff ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
        </div>
        <select className="form-input" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ width: '130px' }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
        </select>
        <select className="form-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '130px' }}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
        <select className="form-input" value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ width: '150px' }}>
          <option value="">All Classes</option>
          {[...new Set(teachers.map(t => t.class_assigned).filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn-secondary" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
          <Download size={18} /> Export
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Subjects</th>
              <th>Role</th>
              <th>Class Assigned</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td>
              </tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                  No teachers found
                </td>
              </tr>
            ) : (
              filteredTeachers.map(teacher => (
                <tr key={teacher.id}>
                  <td>{teacher.staff_id}</td>
                  <td style={{ fontWeight: '600' }}>{teacher.name}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.subjects}</td>
                  <td>{teacher.role === 'admin' ? 'Administrator' : 'Teacher'}</td>
                  <td>{teacher.class_assigned || '-'}</td>
                  <td>
                    {teacher.approved ? (
                      <span className="badge green">Approved</span>
                    ) : (
                      <span className="badge orange">Pending</span>
                    )}
                  </td>
                  <td>
                    {!teacher.approved && (
                      <>
                        <button className="btn-primary" style={{ marginRight: '8px', padding: '6px 12px', fontSize: '13px' }} onClick={() => handleApprove(teacher.id)}>
                          Approve
                        </button>
                        <button className="btn-secondary" style={{ marginRight: '8px', padding: '6px 12px', fontSize: '13px', background: '#fee2e2', color: '#dc2626' }} onClick={() => setShowReject(teacher.id)}>
                          Reject
                        </button>
                      </>
                    )}
                    <button className="btn-secondary" style={{ marginRight: '8px', padding: '6px 12px' }} onClick={() => viewProfile(teacher)}>
                      <User size={16} />
                    </button>
                    <button className="btn-secondary" style={{ marginRight: '8px', padding: '6px 12px' }} onClick={() => handleEdit(teacher)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleDelete(teacher.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button onClick={() => { setShowModal(false); setEditingTeacher(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Staff ID</label>
                <input type="text" className="form-input" value={formData.staff_id} onChange={(e) => setFormData({...formData, staff_id: e.target.value})} required disabled={editingTeacher} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Subjects</label>
                <input type="text" className="form-input" value={formData.subjects} onChange={(e) => setFormData({...formData, subjects: e.target.value})} placeholder="e.g., Math, Physics" required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Password {editingTeacher && '(leave blank to keep current)'}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingTeacher} />
                  <button type="button" className="btn-secondary" onClick={generatePassword} style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                    <Key size={16} /> Generate
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Class Assignment (Optional)</label>
                <select className="form-input" value={formData.class_assigned} onChange={(e) => setFormData({...formData, class_assigned: e.target.value})}>
                  <option value="">No Class Assigned</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '4px' }}>
                  Assigning a class gives teacher: My Class, Attendance, SMS, Class Reports features
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                <Check size={18} />
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showReject && (
        <div className="modal-overlay" onClick={() => setShowReject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Teacher</h3>
              <button onClick={() => setShowReject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Rejection Reason</label>
              <textarea className="form-input" rows="4" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this teacher is being rejected..." />
            </div>
            <button className="btn-primary" onClick={() => handleReject(showReject)} style={{ width: '100%', background: '#dc2626' }}>
              <XCircle size={18} /> Reject Teacher
            </button>
          </div>
        </div>
      )}

      {showProfile && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700' }}>{selectedProfile.name}</h2>
                <div style={{ color: 'var(--text-gray)' }}>{selectedProfile.staff_id} • {selectedProfile.role === 'admin' ? 'Administrator' : 'Teacher'}</div>
              </div>
              <button onClick={() => setShowProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginBottom: '4px' }}>Reports Submitted</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary)' }}>{profileData.reports}</div>
              </div>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginBottom: '4px' }}>SMS Sent</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--green)' }}>{profileData.sms}</div>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Contact Information</h3>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ marginBottom: '8px' }}><strong>Phone:</strong> {selectedProfile.phone}</div>
                <div style={{ marginBottom: '8px' }}><strong>Subjects:</strong> {selectedProfile.subjects}</div>
                <div><strong>Class Assigned:</strong> {selectedProfile.class_assigned || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
