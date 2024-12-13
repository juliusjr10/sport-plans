import React, { useEffect, useState } from 'react';
import { MdViewHeadline } from 'react-icons/md'; // Import MdViewHeadline icon
import { CiSquarePlus } from 'react-icons/ci';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import './PlansPage.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // State for Add Modal
  const [planToDelete, setPlanToDelete] = useState(null);
  const [planToEdit, setPlanToEdit] = useState(null);
  const [editModalError, setEditModalError] = useState('');  // This line defines the error state
  const [role, setRole] = useState(null); // State for storing user role
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    length: '',
    coach: '',
    description: ''
  });
  const [addForm, setAddForm] = useState({ // Form for adding new plan
    title: '',
    length: '',
    coach: '',
    description: ''
  });
  const [addModalError, setAddModalError] = useState(''); // Error specific to Add Modal
  const navigate = useNavigate();

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
      return decodedToken.role; // Assuming your token contains a 'role' field
    }
    return null;
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(searchTerm)
  );
    
  useEffect(() => {
    const role = getRoleFromToken();
    if (role) {
      setRole(role); // Set the role in state
    }
  }, []);
    
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://sport-plans.onrender.com/plans', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlans(data);
        } else {
          setAddModalError('Failed to load plans'); // Error should be inside the modal
        }
      } catch (err) {
        setAddModalError('An error occurred while fetching the plans'); // Error should be inside the modal
      }
    };

    const id = getUserIdFromToken();
    if (id) {
      fetchPlans();
    }
  }, []);

  const handleIconClick = (planId) => {
    navigate(`/plans/${planId}/workouts`);
  };

  const handleAddPlanClick = () => {
    setShowAddModal(true); // Show Add Plan Modal
    setAddModalError(''); // Reset error when opening the modal
  };

  const handleDeletePlan = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/plans/${planToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planToDelete));
        setShowDeleteModal(false);
      } else {
        setAddModalError('Failed to delete the plan'); // Error should be inside the modal
      }
    } catch (err) {
      setAddModalError('An error occurred while deleting the plan'); // Error should be inside the modal
    }
  };

  const openDeleteModal = (planId) => {
    setPlanToDelete(planId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const openEditModal = (plan) => {
    setPlanToEdit(plan.id);
    setEditForm({
      title: plan.title,
      length: plan.length,
      coach: plan.coach,
      description: plan.description
    });
    setShowEditModal(true);
    setEditModalError('');  // Reset the error message when opening the modal
  };
  

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://sport-plans.onrender.com/plans/${planToEdit}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm)
      });
  
      if (response.ok) {
        setPlans(prevPlans =>
          prevPlans.map(plan =>
            plan.id === planToEdit ? { ...plan, ...editForm } : plan
          )
        );
        setShowEditModal(false);
      } else {
        const errorData = await response.json();
        setEditModalError(errorData.error || 'Failed to update the plan');  // Set the error here
      }
    } catch (err) {
      setEditModalError('An error occurred while updating the plan');  // Set the error here
    }
  };
  
  

  const closeEditModal = () => {
    setShowEditModal(false);
    setPlanToEdit(null);
    setEditModalError('');  // Reset the error message when closing the modal
  };
  

  // Handle form changes for Add Plan
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Add Plan form submission
  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://sport-plans.onrender.com/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(addForm)
      });

      if (response.ok) {
        const newPlan = await response.json();
        setPlans(prevPlans => [...prevPlans, newPlan]);
        setShowAddModal(false); // Close the modal after adding the plan
      } else {
        const errorData = await response.json();
        setAddModalError(errorData.error || 'Failed to add the plan'); // Show error only in the modal
      }
    } catch (err) {
      setAddModalError('An error occurred while adding the plan'); // Show error only in the modal
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  return (
    <div className="plans-page">
      <h2 className="page-title">Sports Plans</h2>
      <div className="search-bar-container">
  <input
    type="text"
    placeholder="Search plans by title"
    value={searchTerm}
    onChange={handleSearchChange}
    className="search-bar"
  />
</div>

      <ul className="plans-list">
  {plans.length > 0 ? (
    filteredPlans.map((plan) => (
      <li key={plan.id} className="plan-item">
        <div className="plan-title">
          {plan.title}
          <div className="plan-icons">
            <MdViewHeadline
              className="search-icon"
              title="View Workouts"
              onClick={() => handleIconClick(plan.id)}
            />
            {/* Show edit and delete buttons if the role is admin or if the plan belongs to the current user */}
            {(role === 'admin' || plan.user_id === userId) && (
              <>
                <FaPencilAlt
                  className="edit-icon"
                  title="Edit Plan"
                  onClick={() => openEditModal(plan)}
                />
                <FaTrash
                  className="trash-icon"
                  title="Delete Plan"
                  onClick={() => openDeleteModal(plan.id)}
                />
              </>
            )}
          </div>
        </div>
        <p className="plan-description">{plan.description}</p>
        <p className="plan-length">Length: {plan.length} days</p>
        <p className="plan-coach">Coach: {plan.coach}</p>
      </li>
    ))
  ) : (
    <p className="no-plans">No plans available.</p>
  )}
  <li className="plan-item add-plan-item" onClick={handleAddPlanClick}>
    <CiSquarePlus className="add-plan-icon" title="Add New Plan" />
  </li>
</ul>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure you want to delete this plan?</h3>
            <div className="modal-buttons">
              <button onClick={handleDeletePlan}>Yes</button>
              <button onClick={closeDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && (
  <div className="modal-overlay">
    <div className="modal edit-modal">
      <h3>Edit Plan: {editForm.title}</h3>
      {editModalError && <p className="error-message">{editModalError}</p>}  {/* Display error message here */}
      <form onSubmit={handleUpdatePlan}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditFormChange}
            required
            maxLength="20"
          />
        </div>
        <div className="form-group">
          <label>Length (days)</label>
          <input
            type="number"
            name="length"
            value={editForm.length}
            onChange={handleEditFormChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Coach</label>
          <input
            type="text"
            name="coach"
            value={editForm.coach}
            onChange={handleEditFormChange}
            required
            maxLength="20"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditFormChange}
            required
            maxLength="38"
          />
        </div>
        <div className="modal-buttons">
          <button type="submit">Update Plan</button>
          <button type="button" onClick={closeEditModal}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <h3>Add New Plan</h3>
            {addModalError && <p className="error-message">{addModalError}</p>}
            <form onSubmit={handleAddPlan}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={addForm.title}
                  onChange={handleAddFormChange}
                  required
                  maxLength="20"
                />
              </div>
              <div className="form-group">
                <label>Length (days)</label>
                <input
                  type="number"
                  name="length"
                  value={addForm.length}
                  onChange={handleAddFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Coach</label>
                <input
                  type="text"
                  name="coach"
                  value={addForm.coach}
                  onChange={handleAddFormChange}
                  required
                  maxLength="20"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={addForm.description}
                  onChange={handleAddFormChange}
                  required
                  maxLength="38"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Add Plan</button>
                <button type="button" onClick={closeAddModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlansPage;
