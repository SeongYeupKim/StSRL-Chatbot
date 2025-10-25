import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor and analyze student engagement with the SRL Learning Assistant.
          </p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  );
}
