// pages/JobApplicationsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobService, JobApplication } from '../services/jobService';
import { useToast } from '../context/ToastContext';

const statusOptions = ['pending','reviewed','shortlisted','rejected','accepted'] as const;

type Status = typeof statusOptions[number];

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  accepted: 'Accepted',
};

const statusColor: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
};

const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { showError, showSuccess } = useToast();
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | Status>('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const list = await jobService.getJobApplications(jobId);
      setApps(list);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load applications';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const updateStatus = async (id: string, status: Status) => {
    try {
      setUpdatingId(id);
      await jobService.updateApplicationStatus(id, status);
      setApps(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      showSuccess('Application status updated');
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const addNote = async (id: string) => {
    const content = notes[id]?.trim();
    if (!content) return;
    try {
      setSendingId(id);
      await jobService.addApplicationCommunication(id, { type: 'note', content });
      setNotes(prev => ({ ...prev, [id]: '' }));
      showSuccess('Note added');
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to add note');
    } finally {
      setSendingId(null);
    }
  };

  const filteredApps = statusFilter ? apps.filter(a => a.status === statusFilter) : apps;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-emirates font-bold text-black">Job Applications</h1>
          <p className="text-gray-600 font-montessart">Manage applicants for this job</p>
          <p className="text-gray-700 font-montessart text-sm mt-1">{filteredApps.length} applications</p>
        </div>
        <Link to="/jobs/my" className="bg-white text-[#423772] border border-[#423772] px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-[#423772] hover:text-white transition-colors">Back to My Jobs</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['', ...statusOptions] as Array<'' | Status>).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
              statusFilter === s
                ? 'bg-[#423772] text-white hover:bg-[#312456]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s ? statusLabels[s] : 'All'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
      )}

      <div className="space-y-4">
        {filteredApps.map(a => (
          <div key={a._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-emirates text-lg font-semibold text-gray-900">{a.user?.name || 'Candidate'}</p>
                <p className="text-gray-600 text-sm font-montessart">{a.user?.email || ''}</p>
                <div className="mt-1 text-sm text-gray-600 font-montessart">
                  {a.appliedAt ? `Applied ${new Date(a.appliedAt).toLocaleDateString()}` : ''}
                  {typeof a.matchScore === 'number' ? ` • Match ${a.matchScore}%` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-montessart border ${statusColor[a.status]}`}>
                  {statusLabels[a.status]}
                </span>
                <select
                  value={a.status}
                  onChange={(e) => updateStatus(a._id, e.target.value as Status)}
                  disabled={updatingId === a._id}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-montessart"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes / Communication */}
            <div className="mt-4">
              <textarea
                placeholder="Add an internal note..."
                value={notes[a._id] || ''}
                onChange={(e) => setNotes(prev => ({ ...prev, [a._id]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm font-montessart focus:outline-none focus:ring-2 focus:ring-[#423772]"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => addNote(a._id)}
                  disabled={sendingId === a._id || !notes[a._id]?.trim()}
                  className="bg-white text-[#423772] border border-[#423772] px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-[#423772] hover:text-white transition-colors disabled:opacity-60"
                >
                  {sendingId === a._id ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && apps.length === 0 && (
        <div className="text-gray-600 font-montessart">No applications yet.</div>
      )}
    </div>
  );
};

export default JobApplicationsPage;
