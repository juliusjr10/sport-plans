import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { SlActionUndo } from 'react-icons/sl'; // Import the undo (back) icon from react-icons
import { FaTrash, FaPencilAlt } from 'react-icons/fa'; // Import the trash and pencil icons
import { MdViewHeadline } from 'react-icons/md'; // Import the view headline icon from react-icons
import { jwtDecode } from 'jwt-decode';
import { CiSquarePlus } from 'react-icons/ci'; // Import the add (plus) icon

import './WorkoutsPage.css';

function WorkoutsPage() {
  const { plan_id } = useParams(); 
  const [plan, setPlan] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const [userId, setUserId] = useState(null); // State to store decoded user ID
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [workoutToEdit, setWorkoutToEdit] = useState(null); // Store the workout being edited
  const [addWorkoutError, setAddWorkoutError] = useState('');  // State for "Add Workout" modal error
  const [role, setRole] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    length: '',
    type: '',
    frequency: '',
    description: ''
  });
  
  // State for the "Add New Workout" modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkoutForm, setNewWorkoutForm] = useState({
    name: '',
    length: '',
    type: '',
    frequency: '',
    description: ''
  });

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      setUserId(userId);
      return userId;
    }
    return null;
  };
  const getRoleFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;  // Assuming 'role' is the key for the role in the JWT
      setRole(userRole);
      return userRole;
    }
    return null;
  };
  
  useEffect(() => {
    getUserIdFromToken();  // keep this for user ID
    getRoleFromToken();    // Add this for role
    // Fetch plan and workouts here
  }, [plan_id]);
  
  useEffect(() => {
    getUserIdFromToken();

    const fetchPlanDetails = async () => {
      try {
        const token = localStorage.getItem('authToken'); 
        const response = await fetch(`https://sport-plans.onrender.com/plans/${plan_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlan(data);
        } else {
          setError('Failed to load plan details');
        }
      } catch (err) {
        setError('An error occurred while fetching the plan details');
      }
    };

    const fetchWorkouts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://sport-plans.onrender.com/plans/${plan_id}/workouts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWorkouts(data);
        } else {
          setError('Failed to load workouts');
        }
      } catch (err) {
        setError('An error occurred while fetching the workouts');
      }
    };

    fetchPlanDetails();
    fetchWorkouts();
  }, [plan_id]);

  const handleDeleteWorkout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/workouts/${workoutToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWorkouts(workouts.filter((workout) => workout.id !== workoutToDelete)); // Remove workout from state
        setShowDeleteModal(false);
      } else {
        setError('Failed to delete workout');
      }
    } catch (err) {
      setError('An error occurred while deleting the workout');
    }
  };

  const openDeleteModal = (workoutId) => {
    setWorkoutToDelete(workoutId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setWorkoutToDelete(null);
  };

  const openEditModal = (workout) => {
    setWorkoutToEdit(workout.id);
    setEditForm({
      name: workout.name,
      length: workout.length,
      type: workout.type,
      frequency: workout.frequency,
      description: workout.description
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    setEditError(''); // Clear previous error
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/workouts/${workoutToEdit}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
  
      if (response.ok) {
        setWorkouts(prevWorkouts =>
          prevWorkouts.map(workout =>
            workout.id === workoutToEdit
              ? { ...workout, ...editForm }
              : workout
          )
        );
        setShowEditModal(false);
      } else {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to update the workout');
      }
    } catch (err) {
      setEditError('An error occurred while updating the workout');
    }
  };
  

  const closeEditModal = () => {
    setShowEditModal(false);
    setWorkoutToEdit(null);
  };

  // Handle new workout form data
  const handleNewWorkoutFormChange = (e) => {
    const { name, value } = e.target;
    setNewWorkoutForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    setAddWorkoutError(''); // Clear previous error
    
    const workoutData = {
      ...newWorkoutForm,
      plan_id: plan_id, // Ensure the plan_id is included
    };
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(workoutData),
      });
  
      if (response.ok) {
        const addedWorkout = await response.json();
        setWorkouts([...workouts, addedWorkout]); // Add the new workout to the list
        setShowAddModal(false); // Close the modal
      } else {
        const errorData = await response.json();
        setAddWorkoutError(errorData.error || 'Failed to add the workout');
      }
    } catch (err) {
      setAddWorkoutError('An error occurred while adding the workout');
    }
  };
  
  

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewWorkoutForm({
      name: '',
      length: '',
      type: '',
      frequency: '',
      description: ''
    });
  };

  return (
    <div className="workouts-page">
      <div className="go-back-button">
        <Link to="/plans" className="back-link">
          <SlActionUndo className="back-icon" />
        </Link>
      </div>
  
      <h2 className="page-title">
        {plan ? `${plan.title} workouts:` : 'Loading plan...'}
      </h2>
      {error && <p className="error-message">{error}</p>}
      <ul className="workouts-list">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <li key={workout.id} className="workout-item">
              <div className="headline-icon">
                <Link to={`/workouts/${workout.id}/exercises`}>
                  <MdViewHeadline className="view-headline-icon" title="View Workout Exercises" />
                </Link>
              </div>
  
              <h3 className="workout-title">{workout.name}</h3>
              <p className="workout-detail">Length: {workout.length} mins</p>
              <p className="workout-detail">Type: {workout.type}</p>
              <p className="workout-detail">Frequency: {workout.frequency} times</p>
              <p className="workout-description">{workout.description}</p>
  
              {plan && (plan.user_id === userId || role === 'admin') && (
  <div className="workout-actions">
    <FaPencilAlt
      className="edit-icon"
      onClick={() => openEditModal(workout)}
      title="Edit Workout"
    />
    <FaTrash
      className="delete-icon"
      onClick={() => openDeleteModal(workout.id)}
      title="Delete Workout"
    />
  </div>
)}

            </li>
          ))
        ) : (
          plan && plan.user_id !== userId && role !== 'admin' ? (
            <p className="no-workouts">No workouts available.</p>
          ) : null
        )}
  
  {plan && (plan.user_id === userId || role === 'admin') && (
    <li className="workout-item add-workout" onClick={() => setShowAddModal(true)} title="Add New Workout">
  <div className="add-workout-icon">
    <CiSquarePlus className="plus-icon" />
  </div>
  <p className="add-workout-text">Add Workout</p>
</li>
)}

      </ul>
  
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure you want to delete this workout?</h3>
            <div className="modal-buttons">
              <button onClick={handleDeleteWorkout}>Yes</button>
              <button onClick={closeDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}
  
      {/* Edit Modal */}
      {showEditModal && (
  <div className="modal-overlay">
    <div className="modal edit-modal">
      <h3>Edit Workout: {editForm.name}</h3>
      {editError && <p className="error-message">{editError}</p>} {/* Display error */}
      <form onSubmit={handleUpdateWorkout}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleEditFormChange}
            maxLength={30}
          />
        </div>
        <div className="form-group">
          <label>Length</label>
          <input
            type="number"
            name="length"
            value={editForm.length}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            name="type"
            value={editForm.type}
            onChange={handleEditFormChange}
            maxLength={24}
          />
        </div>
        <div className="form-group">
          <label>Frequency</label>
          <input
            type="number"
            name="frequency"
            value={editForm.frequency}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="form-buttons">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '5px 15px', // Adjust padding for better button size
                border: 'none', // Remove border
                cursor: 'pointer', // Change cursor to pointer
                transition: 'background-color 0.3s', // Smooth transition for hover effect
                fontSize: '24px',
                font: 'Arial',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'} // Hover effect
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'} // Hover effect revert
            >
              Update
            </button>

            <button
              type="button"
              onClick={closeEditModal}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '5px 15px', // Adjust padding for better button size
                border: 'none', // Remove border
                cursor: 'pointer', // Change cursor to pointer
                transition: 'background-color 0.3s', // Smooth transition for hover effect
                fontSize: '24px',
                font: 'Arial',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'} // Hover effect
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'} // Hover effect revert
            >
              Cancel
            </button>
</div>


</div>
            </form>
          </div>
        </div>
      )}
  
      {/* Add Workout Modal */}
      {showAddModal && (
  <div className="modal-overlay">
    <div className="modal add-modal">
      <h3>Add New Workout</h3>
      {addWorkoutError && <p className="error-message">{addWorkoutError}</p>} {/* Display error in modal */}
      <form onSubmit={handleAddWorkout}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={newWorkoutForm.name}
            onChange={handleNewWorkoutFormChange}
            maxLength={30}
          />
        </div>
        <div className="form-group">
          <label>Length</label>
          <input
            type="number"
            name="length"
            value={newWorkoutForm.length}
            onChange={handleNewWorkoutFormChange}
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            name="type"
            value={newWorkoutForm.type}
            onChange={handleNewWorkoutFormChange}
            maxLength={24}
          />
        </div>
        <div className="form-group">
          <label>Frequency</label>
          <input
            type="number"
            name="frequency"
            value={newWorkoutForm.frequency}
            onChange={handleNewWorkoutFormChange}
          />
        </div>
        <div className="form-buttons">
          <div className="button-container">
            <button
              type="submit"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                fontSize: '24px',  // Set font size to 24px
                fontFamily: 'Arial',  // Set font to Arial
                borderRadius: '5px',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Add Workout
            </button>

            <button
              type="button"
              onClick={closeAddModal}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                fontSize: '24px',  // Set font size to 24px
                fontFamily: 'Arial',  // Set font to Arial
                borderRadius: '5px',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
  
}

export default WorkoutsPage;
