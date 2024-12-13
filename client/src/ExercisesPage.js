import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { SlActionUndo } from 'react-icons/sl'; 
import { FaTrash, FaPencilAlt } from 'react-icons/fa'; // Import pencil icon for editing
import { CiSquarePlus } from 'react-icons/ci'; // Import the add (plus) icon
import { jwtDecode } from 'jwt-decode';
import './ExercisesPage.css';

function ExercisesPage() {
  const { workout_id } = useParams(); // Getting workout_id from the URL
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [planUserId, setPlanUserId] = useState(null); // Store the plan's user_id
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null); // Track exercise to delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [addModalError, setAddModalError] = useState(''); // Separate error state for the Add Exercise modal
  const [role, setRole] = useState(null); // Store the user's role
  const [editForm, setEditForm] = useState({
    name: '',
    sets: '',
    reps: '',
    restTime: '',
    tips: ''
  });
  const [showAddModal, setShowAddModal] = useState(false); // To control visibility of Add Exercise Modal
  const [addForm, setAddForm] = useState({
    name: '',
    sets: '',
    reps: '',
    restTime: '',
    tips: ''
  });
  const navigate = useNavigate(); // Initialize navigate function from useNavigate hook
  const [modalError, setModalError] = useState(''); // Added modalError state

  // Function to get the user ID from the token
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
  // Fetch workout title based on workout_id
  const fetchWorkoutTitle = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/workouts/${workout_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkoutTitle(data.name); // Set the workout title
        // Fetch plan's user_id from workout's plan_id
        const planResponse = await fetch(`https://sport-plans.onrender.com/plans/${data.plan_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (planResponse.ok) {
          const planData = await planResponse.json();
          setPlanUserId(planData.user_id); // Set the plan's user_id
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load workout details');
      }
    } catch (err) {
      setError('An error occurred while fetching the workout details');
    }
  };

  // Fetch exercises
  useEffect(() => {
    getUserIdFromToken();
    getRoleFromToken();
    fetchWorkoutTitle();

    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://sport-plans.onrender.com/workouts/${workout_id}/exercises`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setExercises(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to load exercises');
        }
      } catch (err) {
        setError('An error occurred while fetching the exercises');
      }
    };

    fetchExercises();
  }, [workout_id]);

  // Function to handle back navigation
  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  // Handle deleting an exercise (add your delete logic here)
  const handleDeleteExercise = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/exercises/${exerciseToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setExercises(exercises.filter(exercise => exercise.id !== exerciseToDelete)); // Remove deleted exercise from the state
        setShowDeleteModal(false); // Close the delete confirmation modal
      } else {
        setError('Failed to delete the exercise');
      }
    } catch (err) {
      setError('An error occurred while deleting the exercise');
    }
  };

  const openDeleteModal = (exerciseId) => {
    setExerciseToDelete(exerciseId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setExerciseToDelete(null);
  };

  const openEditModal = (exercise) => {
    setExerciseToEdit(exercise.id);
    setEditForm({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      restTime: exercise.restTime,
      tips: exercise.tips || ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/exercises/${exerciseToEdit}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setExercises((prevExercises) =>
          prevExercises.map((exercise) =>
            exercise.id === exerciseToEdit
              ? { ...exercise, ...editForm }
              : exercise
          )
        );
        setShowEditModal(false);
        setModalError(''); // Clear modal error on success
      } else {
        const errorData = await response.json();
        setModalError(errorData.message || 'Sets and reps must be positive numbers, rest time can not be negative.'); // Use modalError instead of error
      }
    } catch (err) {
      setModalError('An error occurred while updating the exercise'); // Use modalError instead of error
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setExerciseToEdit(null);
    setModalError(''); // Clear the modal error when closing the edit modal
  };
  

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddForm({
      name: '',
      sets: '',
      reps: '',
      restTime: '',
      tips: ''
    });
    setAddModalError(''); // Clear the error message
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...addForm, workout_id })
      });
  
      if (response.ok) {
        const newExercise = await response.json();
        setExercises([...exercises, newExercise]);
        setShowAddModal(false); // Close the Add Exercise modal
        setAddModalError(''); // Clear the modal error on success
      } else {
        const errorData = await response.json();
        setAddModalError(errorData.message || 'Sets and reps must be positive numbers, rest time can not be negative.');
      }
    } catch (err) {
      setAddModalError('An error occurred while adding the exercise');
    }
  };
  

  return (
    <div className="exercises-page">
      {/* Undo icon at the top left corner */}
      <div className="back-icon" onClick={handleBackClick}>
        <SlActionUndo size={16} />
      </div>
      <h2>{workoutTitle} exercises:</h2> {/* Display workout title */}
      {/* Only show general errors, not edit-related errors */}
      {error && !showEditModal && <p className="error-message">{error}</p>}
      
      <ul className="exercises-list">
  {exercises.length > 0 ? (
    exercises.map((exercise) => (
      <li key={exercise.id} className="exercise-item">
        <h3 className="exercise-name">{exercise.name}</h3>
        <p className="exercise-details">Sets: {exercise.sets}</p>
        <p className="exercise-details">Reps: {exercise.reps}</p>
        <p className="exercise-details">Rest Time: {exercise.restTime} minutes</p>
        {exercise.tips && <p className="exercise-tips">Tips: {exercise.tips}</p>}

        {/* Show icons for admin or the owner of the plan */}
        {(planUserId === userId || role === 'admin') && (
          <div className="exercise-actions">
            <FaPencilAlt
              className="edit-icon"
              title="Edit Exercise"
              onClick={() => openEditModal(exercise)}
            />
            <FaTrash
              className="trash-icon"
              title="Delete Exercise"
              onClick={() => openDeleteModal(exercise.id)}
            />
          </div>
        )}
      </li>
    ))
  ) : (
    // Only show "No exercises available" if the user is not the owner/admin
    (planUserId !== userId && role !== 'admin') ? (
      <p className="no-workouts">No exercises available.</p>
    ) : null
  )}

  {/* Plus Icon - add this after the list of exercises */}
  {(planUserId === userId || role === 'admin') && (
    <li className="exercise-item add-exercise" onClick={openAddModal}>
      <CiSquarePlus size={40} className="add-icon" title="Add Exercise" />
    </li>
  )}
</ul>

      {/* Add Exercise Modal */}
      {showAddModal && (
  <div className="modal-overlay">
    <div className="modal add-modal"> {/* Add the 'add-modal' class here */}
      <h3>Add Exercise</h3>

      {/* Display error message in the Add Exercise modal */}
      {addModalError && <p className="error-message">{addModalError}</p>}

      <form onSubmit={handleAddExercise}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={addForm.name}
            onChange={handleAddFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Sets</label>
          <input
            type="number"
            name="sets"
            value={addForm.sets}
            onChange={handleAddFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Reps</label>
          <input
            type="number"
            name="reps"
            value={addForm.reps}
            onChange={handleAddFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Rest Time (minutes)</label>
          <input
            type="number"
            name="restTime"
            value={addForm.restTime}
            onChange={handleAddFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Tips</label>
          <textarea
            name="tips"
            value={addForm.tips}
            onChange={handleAddFormChange}
          />
        </div>
        <div className="modal-buttons">
          <button type="submit">Add Exercise</button>
          <button type="button" onClick={closeAddModal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


      
      {/* Edit Exercise Modal */}
      {showEditModal && (
  <div className="modal-overlay">
    <div className="modal edit-modal">
      <h3>Edit Exercise: {editForm.name}</h3>
      
      {/* Display error message at the top of the modal */}
      {modalError && <p className="error-message">{modalError}</p>}
      
      <form onSubmit={handleUpdateExercise}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="form-group">
          <label>Sets</label>
          <input
            type="number"
            name="sets"
            value={editForm.sets}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="form-group">
          <label>Reps</label>
          <input
            type="number"
            name="reps"
            value={editForm.reps}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="form-group">
          <label>Rest Time (minutes)</label>
          <input
            type="number"
            name="restTime"
            value={editForm.restTime}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="form-group">
          <label>Tips</label>
          <textarea
            name="tips"
            value={editForm.tips}
            onChange={handleEditFormChange}
          />
        </div>
        <div className="modal-buttons">
          <button type="submit">Update</button>
          <button type="button" onClick={closeEditModal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Delete Exercise Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure you want to delete this exercise?</h3>
            <div className="modal-buttons">
              <button onClick={handleDeleteExercise}>Yes</button>
              <button onClick={closeDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExercisesPage;
