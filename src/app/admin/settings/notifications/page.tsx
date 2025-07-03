'use client';

import { useState } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
  isActive: boolean;
}

interface NotificationSettings {
  emailTemplates: EmailTemplate[];
  emailSettings: {
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
    footerText: string;
  };
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{agencyName}}',
    template: `
Dear {{firstName}},

Welcome to {{agencyName}}! We're excited to have you on board.

Your account has been successfully created and you can now access our platform.

Getting Started:
1. Complete your profile
2. Set your availability
3. Browse available jobs

If you need any assistance, please don't hesitate to contact our support team.

Best regards,
The {{agencyName}} Team
    `,
    variables: ['firstName', 'agencyName'],
    isActive: true
  },
  {
    id: '2',
    name: 'New Job Alert',
    subject: 'New Job Opportunity: {{jobTitle}}',
    template: `
Hi {{firstName}},

A new job matching your preferences has been posted:

Job Title: {{jobTitle}}
Location: {{location}}
Start Date: {{startDate}}
Rate: {{rate}}

Click here to view the full job details and apply: {{jobLink}}

Best regards,
{{agencyName}}
    `,
    variables: ['firstName', 'jobTitle', 'location', 'startDate', 'rate', 'jobLink', 'agencyName'],
    isActive: true
  },
  {
    id: '3',
    name: 'Document Expiry Reminder',
    subject: 'Important: Document Expiring Soon',
    template: `
Dear {{firstName}},

This is a reminder that your {{documentName}} is due to expire on {{expiryDate}}.

Please ensure you update this document before it expires to maintain compliance and continue working without interruption.

You can upload the updated document here: {{uploadLink}}

If you have any questions, please contact our compliance team.

Thanks,
{{agencyName}}
    `,
    variables: ['firstName', 'documentName', 'expiryDate', 'uploadLink', 'agencyName'],
    isActive: true
  },
  {
    id: '4',
    name: 'Timesheet Reminder',
    subject: 'Timesheet Submission Reminder',
    template: `
Hi {{firstName}},

This is a friendly reminder to submit your timesheet for the week ending {{weekEndDate}}.

Quick links:
- Submit timesheet: {{timesheetLink}}
- View previous timesheets: {{historyLink}}

Please ensure your timesheet is submitted by {{dueDate}} to ensure timely payment.

Best regards,
{{agencyName}}
    `,
    variables: ['firstName', 'weekEndDate', 'timesheetLink', 'historyLink', 'dueDate', 'agencyName'],
    isActive: true
  }
];

const defaultSettings: NotificationSettings = {
  emailTemplates: mockTemplates,
  emailSettings: {
    senderName: 'Upstic Healthcare',
    senderEmail: 'notifications@upstic.com',
    replyToEmail: 'support@upstic.com',
    footerText: 'This email was sent by Upstic Healthcare. Please do not reply to this email.'
  }
};

export default function NotificationSettingsPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditMode(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, templateId: string) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      emailTemplates: prev.emailTemplates.map(template =>
        template.id === templateId
          ? { ...template, [name]: value }
          : template
      )
    }));
  };

  const handleTemplateToggle = (templateId: string, isActive: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailTemplates: prev.emailTemplates.map(template =>
        template.id === templateId
          ? { ...template, isActive }
          : template
      )
    }));
  };

  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [name]: value
      }
    }));
  };

  const DetailsView = () => (
    <div className="space-y-6">
      {/* Email Templates */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Email Templates</h3>
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Templates
            </button>
          </div>
          <div className="space-y-4">
            {settings.emailTemplates.map(template => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Subject: {template.subject}</p>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {template.template}
                </pre>
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Variables: {template.variables.map(v => `{{${v}}}`).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h3>
          <dl className="grid grid-cols-1 gap-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-gray-600">Sender Name</dt>
              <dd className="text-gray-900 font-medium">{settings.emailSettings.senderName}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-gray-600">Sender Email</dt>
              <dd className="text-gray-900 font-medium">{settings.emailSettings.senderEmail}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <dt className="text-gray-600">Reply-To Email</dt>
              <dd className="text-gray-900 font-medium">{settings.emailSettings.replyToEmail}</dd>
            </div>
            <div className="py-3">
              <dt className="text-gray-600 mb-2">Email Footer Text</dt>
              <dd className="text-gray-900">{settings.emailSettings.footerText}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );

  const EditForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Templates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Email Templates</h3>
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
        <div className="space-y-6">
          {settings.emailTemplates.map(template => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Name</label>
                  <input
                    type="text"
                    name="name"
                    value={template.name}
                    onChange={(e) => handleTemplateChange(e, template.id)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={template.subject}
                    onChange={(e) => handleTemplateChange(e, template.id)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Content</label>
                  <textarea
                    name="template"
                    value={template.template}
                    onChange={(e) => handleTemplateChange(e, template.id)}
                    rows={8}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <div className="flex justify-between items-center">
                      <label htmlFor={`template-active-${template.id}`} className="text-sm font-medium text-gray-700">
                        Enabled
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTemplateToggle(template.id, !template.isActive)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                          template.isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            template.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Variables</label>
                  <p className="mt-1 text-sm text-gray-500">
                    {template.variables.map(v => `{{${v}}}`).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
              Sender Name
            </label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              value={settings.emailSettings.senderName}
              onChange={handleEmailSettingsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700">
              Sender Email
            </label>
            <input
              type="email"
              id="senderEmail"
              name="senderEmail"
              value={settings.emailSettings.senderEmail}
              onChange={handleEmailSettingsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="replyToEmail" className="block text-sm font-medium text-gray-700">
              Reply-To Email
            </label>
            <input
              type="email"
              id="replyToEmail"
              name="replyToEmail"
              value={settings.emailSettings.replyToEmail}
              onChange={handleEmailSettingsChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="footerText" className="block text-sm font-medium text-gray-700">
              Email Footer Text
            </label>
            <textarea
              id="footerText"
              name="footerText"
              value={settings.emailSettings.footerText}
              onChange={handleEmailSettingsChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => setIsEditMode(false)}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          Settings updated successfully!
        </div>
      )}
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your email templates and notification settings
        </p>
      </div>
      {isEditMode ? <EditForm /> : <DetailsView />}
    </div>
  );
} 