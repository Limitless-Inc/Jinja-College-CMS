import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, Eye, Users } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    has_streams: 'yes',
    streams: ['']
  });

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      const { data } = await supabase.from('classes').select('*').order('name');
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
    setLoading(false);
  };

  const handleEdit = async (classItem) => {
    setSelectedClass(classItem);
    try {
      // Load existing streams if class has streams
      let existingStreams = [''];
      if (classItem.has_streams) {
        const { data } = await supabase
          .from('streams')
          .select('name')
          .eq('class_id', classItem.id);
        existingStreams = data?.map(s => s.name) || [''];
      }
      
      setFormData({
        name: classItem.name,
        full_name: classItem.full_name || '',
        has_streams: classItem.has_streams ? 'yes' : 'no',
        streams: existingStreams
      });
    } catch (error) {
      console.error('Error loading streams:', error);
    }
    setShowModal(true);
  };

  const loadTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*').eq('approved', true);
    setTeachers(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const classData = {
        name: formData.name,
        full_name: formData.full_name || null,
        has_streams: formData.has_streams === 'yes',
        capacity: 50
      };

      if (selectedClass) {
        // Update existing class
        await supabase
          .from('classes')
          .update(classData)
          .eq('id', selectedClass.id);
        
        // Handle streams for updates
        if (!classData.has_streams) {
          // Delete all streams if no longer has streams
          await supabase
            .from('streams')
            .delete()
            .eq('class_id', selectedClass.id);
        } else if (classData.has_streams) {
          // Delete old streams and add new ones
          await supabase
            .from('streams')
            .delete()
            .eq('class_id', selectedClass.id);
          
          const newStreams = formData.streams
            .filter(s => s.trim())
            .map(stream => ({
              class_id: selectedClass.id,
              name: stream.trim()
            }));
          
          if (newStreams.length > 0) {
            await supabase.from('streams').insert(newStreams);
          }
        }
        alert('✅ Class updated successfully!');
      } else {
        // Create new class
        const { data: newClass, error } = await supabase
          .from('classes')
          .insert(classData)
          .select()
          .single();

        if (error) throw error;

        if (formData.has_streams === 'yes' && formData.streams.length > 0) {
          const streamData = formData.streams
            .filter(s => s.trim())
            .map(stream => ({
              class_id: newClass.id,
              name: stream.trim()
            }));

          if (streamData.length > 0) {
            await supabase.from('streams').insert(streamData);
          }
        }
        alert('✅ Class created successfully!');
      }
      
      setShowModal(false);
      setSelectedClass(null);
      loadClasses();
      setFormData({ name: '', full_name: '', has_streams: 'yes', streams: [''] });
    } catch (error) {
      alert('Error saving class: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all streams and unassign students.')) {
      await supabase.from('classes').delete().eq('id', id);
      loadClasses();
    }
  };

  const viewStreams = async (classItem) => {
    setSelectedClass(classItem);
    // Fetch streams from database
    try {
      const { data } = await supabase
        .from('streams')
        .select('*')
        .eq('class_id', classItem.id);
      setClasses(prev => prev.map(c => 
        c.id === classItem.id ? { ...c, streamsList: data || [] } : c
      ));
    } catch (error) {
      console.error('Error loading streams:', error);
    }
    setShowStreamModal(true);
  };

  const assignTeacher = (stream) => {
    setSelectedStream(stream);
    setShowAssignModal(true);
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const streamName = `${selectedClass.name} ${selectedStream.name}`;
      
      await supabase
        .from('teachers')
        .update({ class_assigned: streamName })
        .eq('id', selectedTeacher);

      alert('✅ Teacher assigned successfully!');
      setShowAssignModal(false);
      setSelectedTeacher('');
      loadTeachers();
    } catch (error) {
      alert('Error assigning teacher: ' + error.message);
    }
  };

  const addStreamField = () => {
    setFormData({ ...formData, streams: [...formData.streams, ''] });
  };

  const removeStreamField = (index) => {
    const newStreams = formData.streams.filter((_, i) => i !== index);
    setFormData({ ...formData, streams: newStreams });
  };

  const updateStream = (index, value) => {
    const newStreams = [...formData.streams];
    newStreams[index] = value;
    setFormData({ ...formData, streams: newStreams });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Classes</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add New Class
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
            Loading classes...
          </div>
        ) : classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
            No classes found. Create your first class to get started.
          </div>
        ) : (
          classes.map(classItem => (
            <div key={classItem.id} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                    {classItem.name}
                  </h3>
                  {classItem.full_name && (
                    <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginBottom: '8px' }}>
                      {classItem.full_name}
                    </p>
                  )}
                  <p style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                    {classItem.has_streams ? '✅ Has streams' : '⊘ No streams'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {classItem.has_streams && (
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => viewStreams(classItem)}>
                      <Eye size={16} />
                      View Streams
                    </button>
                  )}
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleEdit(classItem)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleDelete(classItem.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedClass ? 'Edit Class' : 'Create New Class'}</h3>
              <button onClick={() => { setShowModal(false); setSelectedClass(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="S.1, Senior 1, Form 1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Senior One"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Does this class have streams? *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="has_streams"
                      value="yes"
                      checked={formData.has_streams === 'yes'}
                      onChange={(e) => setFormData({...formData, has_streams: e.target.value})}
                    />
                    Yes, this class has streams
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="has_streams"
                      value="no"
                      checked={formData.has_streams === 'no'}
                      onChange={(e) => setFormData({...formData, has_streams: e.target.value, streams: []})}
                    />
                    No, this class has no streams
                  </label>
                </div>
              </div>

              {formData.has_streams === 'yes' && (
                <div className="form-group">
                  <label className="form-label">Stream Names</label>
                  <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginBottom: '12px' }}>
                    Add the streams available for this class
                  </p>
                  {formData.streams.map((stream, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={stream}
                        onChange={(e) => updateStream(index, e.target.value)}
                        placeholder={`Stream ${index + 1} (e.g., East, West, A, B)`}
                        style={{ flex: 1 }}
                      />
                      {formData.streams.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => removeStreamField(index)}
                          style={{ padding: '10px' }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addStreamField}
                    style={{ marginTop: '8px' }}
                  >
                    <Plus size={16} />
                    Add Another Stream
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Check size={18} />
                {loading ? 'Saving...' : selectedClass ? 'Update Class' : 'Create Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showStreamModal && selectedClass && (
        <StreamsView
          classItem={selectedClass}
          onClose={() => setShowStreamModal(false)}
          onAssignTeacher={assignTeacher}
        />
      )}

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Teacher to {selectedStream?.name}</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Select a teacher:</label>
              {teachers.map(teacher => (
                <label key={teacher.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="teacher"
                    value={teacher.id}
                    checked={selectedTeacher === teacher.id}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: '600' }}>{teacher.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>
                      {teacher.class_assigned ? `Currently teaching: ${teacher.class_assigned}` : 'Not assigned to any class'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAssignTeacher}>
              <Check size={18} />
              Assign Teacher
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StreamsView({ classItem, onClose, onAssignTeacher }) {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    const { data } = await supabase
      .from('streams')
      .select('*')
      .eq('class_id', classItem.id);
    setStreams(data || []);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h3 className="modal-title">{classItem.name} - Streams</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {streams.map(stream => (
            <div key={stream.id} style={{
              padding: '16px',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {stream.name.toUpperCase()} STREAM
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                    Teacher: Not Assigned
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  onClick={() => onAssignTeacher(stream)}
                >
                  <Users size={16} />
                  Assign Teacher
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
