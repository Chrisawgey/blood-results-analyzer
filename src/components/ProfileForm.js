import React, { useState, useEffect } from 'react';

function ProfileForm() {
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    existingConditions: '',
    medications: ''
  });
  
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load profile from localStorage if available
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save profile to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setSaveStatus('Profile saved successfully!');
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setSaveStatus('');
    }, 3000);
  };

  return (
    <div className="profile-form-container">
      <h2>My Profile</h2>
      <p>This information helps us provide more accurate analysis of your blood test results.</p>
      
      {saveStatus && <div className="success-message">{saveStatus}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={profile.age}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={profile.weight}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={profile.height}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="existingConditions">Existing Medical Conditions</label>
          <textarea
            id="existingConditions"
            name="existingConditions"
            value={profile.existingConditions}
            onChange={handleChange}
            placeholder="e.g., Diabetes, Hypertension"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="medications">Current Medications</label>
          <textarea
            id="medications"
            name="medications"
            value={profile.medications}
            onChange={handleChange}
            placeholder="e.g., Metformin, Lisinopril"
          />
        </div>
        
        <button type="submit" className="btn-primary">Save Profile</button>
      </form>
    </div>
  );
}

export default ProfileForm;