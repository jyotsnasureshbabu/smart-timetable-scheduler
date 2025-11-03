import { useState, useEffect } from 'react';
import { classroomAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, X, Building2 } from 'lucide-react';

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    capacity: 60,
    type: 'regular',
    building: '',
    floor: 1,
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await classroomAPI.getAll();
      setClassrooms(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await classroomAPI.update(editingId, formData);
      } else {
        await classroomAPI.create(formData);
      }
      fetchClassrooms();
      closeModal();
    } catch (error) {
      console.error('Error saving classroom:', error);
      alert(error.response?.data?.message || 'Failed to save classroom');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      capacity: item.capacity,
      type: item.type,
      building: item.building || '',
      floor: item.floor || 1,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return;
    
    try {
      await classroomAPI.delete(id);
      fetchClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
      alert('Failed to delete classroom');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', capacity: 60, type: 'regular', building: '', floor: 1 });
  };

  const filteredClassrooms = classrooms.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.building && item.building.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'lab': return 'bg-purple-100 text-purple-700';
      case 'auditorium': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Classrooms Management</h1>
          <p className="text-gray-600 mt-1">Manage classrooms, labs, and auditoriums</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Classroom</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClassrooms.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Building2 className="text-primary-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.building || 'N/A'} - Floor {item.floor || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capacity:</span>
                <span className="font-medium text-gray-800">{item.capacity} students</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Classroom' : 'Add Classroom'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classroom Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g., Room A101"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  >
                    <option value="regular">Regular</option>
                    <option value="lab">Lab</option>
                    <option value="auditorium">Auditorium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Main Building"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Classroom
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classrooms;