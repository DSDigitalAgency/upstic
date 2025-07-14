'use client';

export default function PaymentHistory() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment History</h2>
        <p className="text-gray-600">View your past payments and earnings</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <p className="text-center text-gray-500 py-8">
            Payment history content will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
} 