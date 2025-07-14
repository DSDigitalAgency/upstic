interface EmailNotificationProps {
  email: string;
  tempPassword: string;
  isVisible: boolean;
  onClose: () => void;
}

export function EmailNotification({ email, tempPassword, isVisible, onClose }: EmailNotificationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative p-8 border w-96 shadow-lg rounded-md bg-white">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Sent Successfully</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 mb-4">
              A welcome email has been sent to <strong>{email}</strong> with login credentials.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-600 mb-2">Temporary Password:</p>
              <p className="text-sm font-mono bg-white border border-gray-300 rounded px-2 py-1 text-gray-800">
                {tempPassword}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              The user should change this password on their first login.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 