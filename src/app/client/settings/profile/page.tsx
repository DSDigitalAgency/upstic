'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ClientProfile {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  description: string;
  contactPerson: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  subscriptionPlan: string;
  status: string;
}

export default function ClientSettingsProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientProfile>>({});

  useEffect(() => {
    // Mock data for client profile
    const mockProfile: ClientProfile = {
      id: user?.id || '',
      companyName: 'St. Mary\'s Healthcare Facility',
      email: 'admin@stmarys.com',
      phone: '+44 20 7946 0958',
      address: '123 Healthcare Street, London, SW1A 1AA',
      industry: 'HOSPITAL',
      description: 'Leading healthcare facility providing comprehensive medical services',
      contactPerson: {
        name: 'Sarah Johnson',
        role: 'Facility Manager',
        email: 'sarah.johnson@stmarys.com',
        phone: '+44 20 7946 0959'
      },
      subscriptionPlan: 'Premium',
      status: 'ACTIVE'
    };

    setProfile(mockProfile);
    setFormData(mockProfile);
    setLoading(false);
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof ClientProfile] as object) || {}),
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

  const handleSave = () => {
    // Mock save functionality
    setProfile(formData as ClientProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Industry
              </label>
              {isEditing ? (
                <select
                  value={formData.industry || ''}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                >
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="CARE_HOME">Care Home</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900">{profile?.industry}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Address
            </label>
            {isEditing ? (
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
              />
            ) : (
              <p className="text-sm text-gray-900">{profile?.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
              />
            ) : (
              <p className="text-sm text-gray-900">{profile?.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Contact Person</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contact Person Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.contactPerson?.name || ''}
                  onChange={(e) => handleInputChange('contactPerson.name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.contactPerson.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.contactPerson?.role || ''}
                  onChange={(e) => handleInputChange('contactPerson.role', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.contactPerson.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contact Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.contactPerson?.email || ''}
                  onChange={(e) => handleInputChange('contactPerson.email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.contactPerson.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.contactPerson?.phone || ''}
                  onChange={(e) => handleInputChange('contactPerson.phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile?.contactPerson.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Subscription Plan
              </label>
              <p className="text-sm text-gray-900">{profile?.subscriptionPlan}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Account Status
              </label>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {profile?.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 