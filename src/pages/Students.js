import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Check, Download, Filter, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Students({ user }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [formData, setFormData] = useState({
    admission_no: '',
    full_name: '',
    gender: '',
    class_name: '',
    parent_name: '',
    parent_phone: '',
    date_of_birth: '',
    notes: ''
  });

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const { data: classesData } = await supabase.from('classes').select('*').order('name');
      const { data: streamsData } = await supabase.from('streams').select('*');
      setClasses(classesData || []);
      setStreams(streamsData || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      let query = supabase.from('students').select('*');
      
      if (user.class_assigned && user.role !== 'admin') {
        query = query.eq('class_name', user.class_assigned);
      }

      const { data, error } = await query.order('full_name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
    setLoading(false);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      admission_no: student.admission_no,
      full_name: student.full_name,
      gender: student.gender,
      class_name: student.class_name,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      date_of_birth: student.date_of_birth || '',
      notes: student.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStudent) {
        await supabase.from('students').update(formData).eq('id', editingStudent.id);
        alert('✅ Student updated successfully!');
      } else {
        const { data: existing } = await supabase
          .from('students')
          .select('admission_no')
          .eq('admission_no', formData.admission_no)
          .single();

        if (existing) {
          alert('⚠️ Admission number already exists. Please use a different number.');
          setLoading(false);
          return;
        }

        await supabase.from('students').insert(formData);
        alert('✅ Student added successfully!');
      }
      
      setShowModal(false);
      setEditingStudent(null);
      loadStudents();
      setFormData({ admission_no: '', full_name: '', gender: '', class_name: '', parent_name: '', parent_phone: '', date_of_birth: '', notes: '' });
    } catch (error) {
      alert('Error saving student: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await supabase.from('students').delete().eq('id', id);
      loadStudents();
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(search.toLowerCase()) ||
      s.class_name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !filterClass || s.class_name === filterClass;
    const matchesGender = !filterGender || s.gender === filterGender;
    const matchesCategory = !filterCategory || getCategory(s.attendance_percentage || 0) === filterCategory;
    return matchesSearch && matchesClass && matchesGender && matchesCategory;
  });

  const getCategory = (percentage) => {
    if (percentage >= 90) return 'Green';
    if (percentage >= 70) return 'Orange';
    return 'Red';
  };

  const getCategoryBadge = (percentage) => {
    const category = getCategory(percentage);
    if (category === 'Green') return <span className="badge green">Green</span>;
    if (category === 'Orange') return <span className="badge orange">Orange</span>;
    return <span className="badge red">Red</span>;
  };

  const exportToExcel = () => {
    const dataToExport = selectedStudents.length > 0 
      ? students.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;
    
    const csv = [
      ['Admission No', 'Full Name', 'Gender', 'Class', 'Parent Name', 'Parent Phone', 'DOB', 'Category'].join(','),
      ...dataToExport.map(s => [
        s.admission_no,
        s.full_name,
        s.gender,
        s.class_name,
        s.parent_name,
        s.parent_phone,
        s.date_of_birth || '',
        getCategory(s.attendance_percentage || 0)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    if (window.confirm(`Delete ${selectedStudents.length} selected students?`)) {
      await supabase.from('students').delete().in('id', selectedStudents);
      setSelectedStudents([]);
      loadStudents();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Students</h2>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Student
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <select className="form-input" value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ width: '150px' }}>
          <option value="">All Classes</option>
          {[...new Set(students.map(s => s.class_name))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-input" value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={{ width: '120px' }}>
          <option value="">All Genders</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
        <select className="form-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: '130px' }}>
          <option value="">All Categories</option>
          <option value="Green">Green</option>
          <option value="Orange">Orange</option>
          <option value="Red">Red</option>
        </select>
        <button className="btn-secondary" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
          <Download size={18} />
          Export
        </button>
        {selectedStudents.length > 0 && user.role === 'admin' && (
          <button className="btn-secondary" onClick={bulkDelete} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fee2e2', color: '#dc2626' }}>
            <Trash2 size={18} />
            Delete ({selectedStudents.length})
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {user.role === 'admin' && (
                <th style={{ width: '40px' }}>
                  <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
              )}
              <th>Admission No</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Class</th>
              <th>Parent Name</th>
              <th>Parent Phone</th>
              <th>Category</th>
              {user.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  {user.role === 'admin' && (
                    <td>
                      <button onClick={() => toggleSelect(student.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {selectedStudents.includes(student.id) ? <CheckSquare size={18} color="#1e40af" /> : <Square size={18} />}
                      </button>
                    </td>
                  )}
                  <td>{student.admission_no}</td>
                  <td style={{ fontWeight: '600' }}>{student.full_name}</td>
                  <td>{student.gender}</td>
                  <td>{student.class_name}</td>
                  <td>{student.parent_name}</td>
                  <td>{student.parent_phone}</td>
                  <td>{getCategoryBadge(student.attendance_percentage || 0)}</td>
                  {user.role === 'admin' && (
                    <td>
                      <button className="btn-secondary" style={{ marginRight: '8px', padding: '6px 12px' }} onClick={() => handleEdit(student)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleDelete(student.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingStudent(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => { setShowModal(false); setEditingStudent(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Admission Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.admission_no}
                  onChange={(e) => setFormData({...formData, admission_no: e.target.value})}
                  placeholder="STU001"
                  required
                  disabled={editingStudent}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Akena Peter"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={formData.gender === 'M'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    />
                    Male
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={formData.gender === 'F'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    />
                    Female
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Class/Stream *</label>
                <select
                  className="form-input"
                  value={formData.class_name}
                  onChange={(e) => setFormData({...formData, class_name: e.target.value})}
                  required
                >
                  <option value="">Select class</option>
                  {classes.map(classItem => (
                    <React.Fragment key={classItem.id}>
                      {classItem.has_streams ? (
                        streams
                          .filter(s => s.class_id === classItem.id)
                          .map(stream => (
                            <option key={stream.id} value={`${classItem.name} ${stream.name}`}>
                              {classItem.name} {stream.name}
                            </option>
                          ))
                      ) : (
                        <option value={classItem.name}>{classItem.name} (no streams)</option>
                      )}
                    </React.Fragment>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Parent/Guardian Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({...formData, parent_name: e.target.value})}
                  placeholder="Mr. Akena John"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                  placeholder="+256701234567"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Medical conditions, special needs, etc."
                  rows="3"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Check size={18} />
                {loading ? 'Saving...' : (editingStudent ? 'Update Student' : 'Save Student')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
