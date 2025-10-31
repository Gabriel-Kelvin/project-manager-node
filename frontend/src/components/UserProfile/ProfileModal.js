import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Bell, 
  Globe, 
  Shield, 
  LogOut, 
  Trash2,
  Save,
  Edit3
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuthStore();
  const { success, error } = useToastStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    notifications: {
      email: true,
      taskReminders: true,
      teamUpdates: true
    },
    language: 'en',
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      await updateUser(formData);
      
      success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
      onClose();
    } catch (err) {
      error('Failed to logout');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement account deletion
      error('Account deletion not implemented yet');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile & Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Info Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h3>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Username (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-900 font-medium">{user.username}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              {/* Email (editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="w-full"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Join Date (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5" />
              Preferences
            </h3>

            <div className="space-y-4">
              {/* Notifications */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email notifications</span>
                    <input
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Task reminders</span>
                    <input
                      type="checkbox"
                      checked={formData.notifications.taskReminders}
                      onChange={(e) => handleInputChange('notifications.taskReminders', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Team updates</span>
                    <input
                      type="checkbox"
                      checked={formData.notifications.teamUpdates}
                      onChange={(e) => handleInputChange('notifications.teamUpdates', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Account Actions Section */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" />
              Account Actions
            </h3>

            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => {/* Open change password modal */}}
                className="w-full justify-start"
              >
                Change Password
              </Button>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>

              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  email: user?.email || '',
                  notifications: {
                    email: true,
                    taskReminders: true,
                    teamUpdates: true
                  },
                  language: 'en',
                  theme: 'light'
                });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProfileModal;
