import React, { useState } from 'react';
import { X, Eye, EyeOff, Check, X as XIcon, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { changePassword } = useAuthStore();
  const { success, error } = useToastStore();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 2) return { level: 'weak', color: 'red', percentage: 20 };
    if (score < 4) return { level: 'medium', color: 'yellow', percentage: 60 };
    return { level: 'strong', color: 'green', percentage: 100 };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const getPasswordRequirements = () => {
    const password = formData.newPassword;
    return [
      {
        text: 'At least 8 characters',
        met: password.length >= 8
      },
      {
        text: 'Contains uppercase letter',
        met: /[A-Z]/.test(password)
      },
      {
        text: 'Contains lowercase letter',
        met: /[a-z]/.test(password)
      },
      {
        text: 'Contains number',
        met: /\d/.test(password)
      },
      {
        text: 'Contains special character',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];
  };

  const isFormValid = () => {
    return (
      formData.currentPassword &&
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword === formData.confirmPassword &&
      formData.newPassword !== formData.currentPassword &&
      passwordStrength.level !== 'weak'
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      error('Please fill in all fields correctly');
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      success('Password changed successfully!');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onClose();
    } catch (err) {
      error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Enter your current password"
                className="w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter your new password"
                className="w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.level}
                  </span>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="mt-3 space-y-1">
                {getPasswordRequirements().map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {requirement.met ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <XIcon className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={requirement.met ? 'text-green-600' : 'text-gray-500'}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your new password"
                className="w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XIcon className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Security Notice
                </h4>
                <p className="text-xs text-blue-700">
                  Your password is encrypted and stored securely. After changing your password, 
                  you'll need to log in again on all devices.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
