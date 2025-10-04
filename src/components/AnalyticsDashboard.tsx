import { BarChart3, TrendingUp, Clock, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { storageService } from '../services/storage';
import { useEffect, useState } from 'react';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalGenerations: 0,
    totalFeedback: 0,
    avgRating: 0,
    positiveCount: 0,
    negativeCount: 0,
    editRate: 0,
    copyCount: 0,
    downloadCount: 0,
    regenerateCount: 0,
    typeDistribution: {} as Record<string, number>
  });

  useEffect(() => {
    const calculateStats = () => {
      const generations = storageService.getGenerations();
      const feedback = storageService.getAllFeedback();
      const interactions = storageService.getInteractions();

      const ratings = feedback.filter(f => f.rating).map(f => f.rating!);
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

      const positiveCount = feedback.filter(f => f.feedbackType === 'positive').length;
      const negativeCount = feedback.filter(f => f.feedbackType === 'negative').length;
      const editCount = feedback.filter(f => f.wasEdited).length;
      const editRate = feedback.length > 0 ? (editCount / feedback.length) * 100 : 0;

      const copyCount = interactions.filter(i => i.actionType === 'copy').length;
      const downloadCount = interactions.filter(i => i.actionType === 'download').length;
      const regenerateCount = interactions.filter(i => i.actionType === 'regenerate').length;

      const typeDistribution: Record<string, number> = {};
      generations.forEach(g => {
        typeDistribution[g.umlType] = (typeDistribution[g.umlType] || 0) + 1;
      });

      setStats({
        totalGenerations: generations.length,
        totalFeedback: feedback.length,
        avgRating,
        positiveCount,
        negativeCount,
        editRate,
        copyCount,
        downloadCount,
        regenerateCount,
        typeDistribution
      });
    };

    calculateStats();
    const interval = setInterval(calculateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const exportData = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uml-feedback-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-slate-700" />
          <h2 className="text-xl font-bold text-slate-800">Analytics Dashboard</h2>
        </div>
        <button
          onClick={exportData}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Export RL Training Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Generations"
          value={stats.totalGenerations}
          color="blue"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Average Rating"
          value={stats.avgRating.toFixed(1)}
          color="yellow"
        />
        <StatCard
          icon={<ThumbsUp className="w-5 h-5" />}
          label="Positive Feedback"
          value={stats.positiveCount}
          color="green"
        />
        <StatCard
          icon={<ThumbsDown className="w-5 h-5" />}
          label="Negative Feedback"
          value={stats.negativeCount}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            User Interactions
          </h3>
          <div className="space-y-3">
            <InteractionRow label="Copy Actions" value={stats.copyCount} />
            <InteractionRow label="Downloads" value={stats.downloadCount} />
            <InteractionRow label="Regenerations" value={stats.regenerateCount} />
            <InteractionRow label="Edit Rate" value={`${stats.editRate.toFixed(1)}%`} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Diagram Type Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.typeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 capitalize">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(count / stats.totalGenerations) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-2">RL Training Metrics</h3>
        <p className="text-sm text-slate-600 mb-3">
          This data can be used to train reinforcement learning models. Export the full dataset to begin training.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Feedback Coverage</span>
            <p className="font-semibold text-slate-800">
              {stats.totalGenerations > 0
                ? `${((stats.totalFeedback / stats.totalGenerations) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Positive Ratio</span>
            <p className="font-semibold text-slate-800">
              {stats.totalFeedback > 0
                ? `${((stats.positiveCount / stats.totalFeedback) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Edit Signal</span>
            <p className="font-semibold text-slate-800">{stats.editRate.toFixed(1)}%</p>
          </div>
          <div>
            <span className="text-slate-500">Regenerate Rate</span>
            <p className="font-semibold text-slate-800">
              {stats.totalGenerations > 0
                ? `${((stats.regenerateCount / stats.totalGenerations) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function InteractionRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
