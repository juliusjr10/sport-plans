import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPlanPage.css'; // Import the CSS for styling

function AddPlanPage() {
  const [title, setTitle] = useState('');
  const [length, setLength] = useState('');
  const [coach, setCoach] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare the data to be sent to the API
    const newPlan = {
      title,
      length: parseInt(length),
      coach,
      description,
    };
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPlan),
      });
  
      if (response.ok) {
        // No need to capture `data` since we aren't using it
        navigate('/plans'); // Redirect to plans page after successful plan creation
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create plan');
      }
    } catch (err) {
      setError('An error occurred while creating the plan.');
    }
  };

  return (
    <div className="add-plan-page">
      <h2>Create New Plan</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="plan-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Length (Days)</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Coach</label>
          <input
            type="text"
            value={coach}
            onChange={(e) => setCoach(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit">Create Plan</button>
      </form>
    </div>
  );
}

export default AddPlanPage;
