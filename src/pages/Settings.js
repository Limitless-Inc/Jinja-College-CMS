import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Settings as SettingsIcon, User, Lock, Save, Upload, X, School, Calendar, MessageSquare, FileText, Shield } from 'lucide-react';

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('admin-profile');
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // School settings
    schoolName: 'Jinja College',
    schoolAddress: 'P.O. Box 211, Jinja, Uganda',
    schoolPhone: '+256434120571',
    schoolEmail: 'info@jinjacollege.ug',
    schoolMotto: 'Strive to Excel',
    // Attendance settings
    attendanceWindowStart: '07:00',
    attendanceWindowEnd: '09:00',
    greenThreshold: '90',
    orangeThreshold: '70',
    redThreshold: '70',
    consecutiveAbsences: '5',
    // SMS settings
    smsProvider: 'Africa\'s Talking',
    senderID: 'JINJACOL',
    // Reporting settings
    reportDay: 'Friday',
    reportDeadline: '17:00',
    // Duty settings
    dutyDuration: 'One Week',
    maxTeamSize: '5',
    minTeamSize: '1'
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'admin-profile', label: 'Admin Profile', icon: User },
    { id: 'school', label: 'School Profile', icon: School },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'sms', label: 'SMS & Notifications', icon: MessageSquare },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'duty', label: 'Duty Management', icon: Shield }
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    setMessage('✅ Settings saved successfully!');
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setMessage('❌ Please select a valid image file (JPG, PNG, or GIF)');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ File too large. Maximum size is 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setProfilePicture(file);
    setProfilePicturePreview(URL.createObjectURL(file));
    setMessage('');
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const updateData = { 
        name: formData.name, 
        phone: formData.phone 
      };
      
      // If profile picture selected, convert to base64 and store in database
      if (profilePicture) {
        const reader = new FileReader();
        reader.onerror = () => {
          setMessage('❌ Error reading image file');
          setLoading(false);
        };
        reader.onloadend = async () => {
          try {
            updateData.profile_picture = reader.result;
            await saveProfile(updateData);
          } catch (err) {
            setMessage('❌ Error updating profile: ' + (err.message || 'Unknown error'));
            setLoading(false);
          }
        };
        reader.readAsDataURL(profilePicture);
      } else {
        await saveProfile(updateData);
      }
    } catch (error) {
      setMessage('❌ Error updating profile: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const saveProfile = async (updateData) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message || 'Database update failed');
      }

      setMessage('✅ Profile updated successfully!');
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 1500);
      setLoading(false);
    } catch (err) {
      throw err;
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword) {
      setMessage('Please fill all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // Verify current password
    const { data: userData } = await supabase
      .from('teachers')
      .select('password')
      .eq('id', user.id)
      .single();

    if (userData.password !== formData.currentPassword) {
      setMessage('Current password is incorrect');
      setLoading(false);
      return;
    }

    // Update password
    const { error } = await supabase
      .from('teachers')
      .update({ password: formData.newPassword })
      .eq('id', user.id);

    setLoading(false);
    if (error) {
      setMessage('Error changing password');
    } else {
      setMessage('Password changed successfully!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const renderAdminProfile = () => (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>  
            <User size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Profile Picture</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border)', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : user.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={60} style={{ color: '#9ca3af' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label className="btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} />
                Upload Photo
                <input type="file" accept="image/jpeg,image/png,image/gif" onChange={handleProfilePictureChange} style={{ display: 'none' }} />
              </label>
              {(profilePicturePreview || user.profile_picture) && (
                <button onClick={removeProfilePicture} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <X size={18} />
                  Remove
                </button>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-gray)', textAlign: 'center' }}>
              Allowed: JPG, PNG, GIF • Max size: 5MB
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <User size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Profile Information</h2>
          </div>
          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input 
                  className="form-input" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="form-label">Staff ID</label>
                <input 
                  className="form-input" 
                  value={user.staff_id} 
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>
                  Staff ID cannot be changed
                </div>
              </div>
              <div>
                <label className="form-label">Role</label>
                <input 
                  className="form-input" 
                  value={user.role === 'admin' ? 'Administrator' : 'Teacher'} 
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Lock size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label">Current Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={formData.currentPassword} 
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={formData.newPassword} 
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password"
                  className="form-input" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
    </div>
  );

  const renderSchoolProfile = () => (
    <div className="card">
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>School Profile Settings</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">School Name</label>
          <input className="form-input" value={formData.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} />
        </div>
        <div>
          <label className="form-label">School Address</label>
          <input className="form-input" value={formData.schoolAddress} onChange={(e) => handleChange('schoolAddress', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">School Phone</label>
            <input className="form-input" value={formData.schoolPhone} onChange={(e) => handleChange('schoolPhone', e.target.value)} />
          </div>
          <div>
            <label className="form-label">School Email</label>
            <input className="form-input" type="email" value={formData.schoolEmail} onChange={(e) => handleChange('schoolEmail', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="form-label">School Motto</label>
          <input className="form-input" value={formData.schoolMotto} onChange={(e) => handleChange('schoolMotto', e.target.value)} />
        </div>
        <button onClick={saveGeneralSettings} className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="card">
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Attendance Settings</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">Attendance Marking Window</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input type="time" className="form-input" value={formData.attendanceWindowStart} onChange={(e) => handleChange('attendanceWindowStart', e.target.value)} />
            <input type="time" className="form-input" value={formData.attendanceWindowEnd} onChange={(e) => handleChange('attendanceWindowEnd', e.target.value)} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>Teachers can only mark attendance during these hours</div>
        </div>
        <div>
          <label className="form-label">Attendance Categories</label>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Green:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" className="form-input" value={formData.greenThreshold} onChange={(e) => handleChange('greenThreshold', e.target.value)} style={{ width: '80px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>% and above</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Orange:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" className="form-input" value={formData.orangeThreshold} onChange={(e) => handleChange('orangeThreshold', e.target.value)} style={{ width: '80px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>% to 89%</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Red:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>Below</span>
                <input type="number" className="form-input" value={formData.redThreshold} onChange={(e) => handleChange('redThreshold', e.target.value)} style={{ width: '80px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>%</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="form-label">Auto-flag Red Students After</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="number" className="form-input" value={formData.consecutiveAbsences} onChange={(e) => handleChange('consecutiveAbsences', e.target.value)} style={{ width: '80px' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-gray)' }}>consecutive absences</span>
          </div>
        </div>
        <button onClick={saveGeneralSettings} className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderSMS = () => (
    <div className="card">
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>SMS & Notification Settings</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">SMS Provider</label>
          <select className="form-input" value={formData.smsProvider} onChange={(e) => handleChange('smsProvider', e.target.value)}>
            <option>Africa's Talking</option>
            <option>Twilio</option>
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label className="form-label">Sender ID</label>
          <input className="form-input" value={formData.senderID} onChange={(e) => handleChange('senderID', e.target.value)} placeholder="e.g., JINJACOL" />
          <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>This name appears as the SMS sender</div>
        </div>
        <div>
          <label className="form-label">SMS Templates</label>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Absence Alert</label>
              <textarea className="form-input" rows="2" defaultValue="Dear Parent, [Student] was marked absent today at Jinja College." style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>Red Alert</label>
              <textarea className="form-input" rows="2" defaultValue="URGENT: Your child [Student]'s attendance is [Percentage]%. Please contact school." style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>
        <button onClick={saveGeneralSettings} className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderReporting = () => (
    <div className="card">
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Reporting Settings</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">Weekly Report Day</label>
          <select className="form-input" value={formData.reportDay} onChange={(e) => handleChange('reportDay', e.target.value)}>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
          </select>
          <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>When weekly reports are due</div>
        </div>
        <div>
          <label className="form-label">Report Deadline Time</label>
          <input type="time" className="form-input" value={formData.reportDeadline} onChange={(e) => handleChange('reportDeadline', e.target.value)} />
          <div style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>Cutoff time for report submissions</div>
        </div>
        <button onClick={saveGeneralSettings} className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderDuty = () => (
    <div className="card">
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Duty Management Settings</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label className="form-label">Default Duty Duration</label>
          <select className="form-input" value={formData.dutyDuration} onChange={(e) => handleChange('dutyDuration', e.target.value)}>
            <option>One Week</option>
            <option>Two Weeks</option>
            <option>One Month</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Maximum Team Size</label>
            <input type="number" className="form-input" value={formData.maxTeamSize} onChange={(e) => handleChange('maxTeamSize', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Minimum Team Size</label>
            <input type="number" className="form-input" value={formData.minTeamSize} onChange={(e) => handleChange('minTeamSize', e.target.value)} />
          </div>
        </div>
        <button onClick={saveGeneralSettings} className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={28} style={{ color: 'var(--primary)' }} />
          <h1 style={{ margin: 0 }}>Settings</h1>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 20px', background: message.includes('✅') ? '#10b981' : '#ef4444', color: 'white', borderRadius: '8px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Vertical Sidebar */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div className="card" style={{ padding: '8px' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    textAlign: 'left',
                    marginBottom: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          {activeTab === 'admin-profile' && renderAdminProfile()}
          {activeTab === 'school' && renderSchoolProfile()}
          {activeTab === 'attendance' && renderAttendance()}
          {activeTab === 'sms' && renderSMS()}
          {activeTab === 'reporting' && renderReporting()}
          {activeTab === 'duty' && renderDuty()}
        </div>
      </div>
    </div>
  );
}
