import AdminDashboard from '@/components/AdminDashboard';
import StudentManagement from '@/components/StudentManagement';
import AdminAuth from '@/components/AdminAuth';

export default function AdminPage() {
  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Monitor and analyze student engagement with the SRL Learning Assistant.
            </p>
          </div>
          
          <div className="space-y-8">
            <StudentManagement />
            <AdminDashboard />
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}
