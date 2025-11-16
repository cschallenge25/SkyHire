// pages/MyApplicationsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { jobService, ApplicationSummary } from '../services/jobService';
import { FiMapPin, FiClock } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

const statusLabels: Record<ApplicationSummary['status'], string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  accepted: 'Accepted',
};

const statusColor: Record<ApplicationSummary['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
};

const MyApplicationsPage: React.FC = () => {
  const { showError } = useToast();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<'' | ApplicationSummary['status']>('');

  const filters = useMemo(() => ([
    { key: '', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'accepted', label: 'Accepted' },
  ]), []);

  const load = async (opts?: { reset?: boolean; page?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const targetPage = opts?.page ?? 1;
      const { applications: list, pages: totalPages } = await jobService.getMyApplications({ page: targetPage, limit: 10, status: status || undefined });
      setPages(totalPages || 1);
      setPage(targetPage);
      setApplications(prev => opts?.reset ? list : (targetPage === 1 ? list : [...prev, ...list]));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load applications';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ reset: true, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadMore = () => {
    if (page < pages) {
      load({ page: page + 1 });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-emirates font-bold text-black">My Applications</h1>
          <p className="text-gray-600 font-montessart">Track your application statuses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key as any)}
            className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
              status === f.key
                ? 'bg-[#423772] text-white hover:bg-[#312456]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
      )}

      {!loading && applications.length === 0 && (
        <div className="text-gray-600 font-montessart">No applications yet.</div>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <div key={app._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 font-emirates truncate">{app.job.company}</h3>
                </div>
                <p className="text-[#423772] font-montessart font-semibold">{app.job.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-600 font-montessart text-sm">
                  <span className="flex items-center"><FiMapPin className="mr-1 text-[#423772]" />{app.job.location}</span>
                  {app.appliedAt && (
                    <span className="flex items-center"><FiClock className="mr-1 text-[#423772]" />Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  )}
                  {typeof app.matchScore === 'number' && (
                    <span className="text-gray-700">Match {app.matchScore}%</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-montessart border ${statusColor[app.status]}`}>
                  {statusLabels[app.status]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {page < pages && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-white text-[#423772] border border-[#423772] px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#423772] hover:text-white transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
