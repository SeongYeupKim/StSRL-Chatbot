import ResearchAnalytics from '@/components/ResearchAnalytics';

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Analytics</h1>
          <p className="text-gray-600">
            Comprehensive analysis of student engagement and learning trajectories in the SRL Learning Assistant.
          </p>
        </div>
        
        <ResearchAnalytics />
      </div>
    </div>
  );
}
