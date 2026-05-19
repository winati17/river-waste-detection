'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobHistory, deleteJob } from '../services/api';
import Link from 'next/link';
import { DetectionResult } from '../types';

export default function HistoryList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['job-history'],
    queryFn: getJobHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-history'] });
    },
  });

  if (isLoading) return <div className="text-sm text-slate-500">Loading history...</div>;
  if (!data || !data.jobs || data.jobs.length === 0) return <div className="text-sm text-slate-500">No detection history found.</div>;

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 mt-8">
      <h3 className="font-semibold text-lg text-slate-800 sticky top-0 bg-white/90 backdrop-blur-sm py-2">Detection History</h3>
      {data.jobs.map((job: DetectionResult) => (
        <div key={job.job_id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex-1 mb-3 sm:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                job.status === 'completed' ? 'bg-green-100 text-green-700' :
                job.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {job.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">{job.job_id.split('-')[0]}...</span>
            </div>
            {job.status === 'completed' && (
              <p className="text-sm text-slate-600">
                Found <strong className="text-slate-900">{job.total_detections}</strong> items
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link 
              href={`/results/${job.job_id}`}
              className="flex-1 sm:flex-none text-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            >
              View
            </Link>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this job history?')) {
                  deleteMutation.mutate(job.job_id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
