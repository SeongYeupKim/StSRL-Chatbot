import DataViewer from '@/components/DataViewer';
import AdminAuth from '@/components/AdminAuth';

export default function DataPage() {
  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Data Archive</h1>
            <p className="text-gray-600">
              View and download archived session data from the SRL Learning Assistant.
            </p>
          </div>
          
          <DataViewer />
        </div>
      </div>
    </AdminAuth>
  );
}
