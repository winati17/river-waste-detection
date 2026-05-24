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

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 mt-8">
      <h3 className="font-semibold text-lg text-slate-800 sticky top-0 bg-white/90 backdrop-blur-sm py-2">
        Detection History
      </h3>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg w-16"></div>
            </div>
          ))}
        </div>
      ) : !data || !data.jobs || data.jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 mb-3 text-slate-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h4 className="text-sm font-medium text-slate-700 mb-1">
            No history found
          </h4>
          <p className="text-xs text-slate-500 max-w-[240px]">
            Your processed videos and detection results will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.jobs.map((job: DetectionResult) => (
            <div
              key={job.job_id}
              className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 mb-3 sm:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : job.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {job.job_id.split("-")[0]}...
                  </span>
                </div>
                {job.status === "completed" && (
                  <p className="text-sm text-slate-600">
                    Found{" "}
                    <strong className="text-slate-900">
                      {job.total_detections}
                    </strong>{" "}
                    items
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
                    if (
                      confirm("Are you sure you want to delete this job history?")
                    ) {
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
      )}
    </div>
  );
}
