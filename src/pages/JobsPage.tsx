// pages/JobsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiMapPin, FiDollarSign, FiFilter, FiTrendingUp, FiHeart, FiShare2 } from "react-icons/fi";
import { jobService, MatchingJob } from "../services/jobService";
import { chatService } from "../services/chatService";
import { userService } from "../services/userService";
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Link, useLocation } from 'react-router-dom';

const JobsPage: React.FC = () => {
  const [visibleJobs, setVisibleJobs] = useState(5);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [matches, setMatches] = useState<MatchingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  const currentUser = authService.getCurrentUser();
  const isRecruiter = currentUser?.role === 'recruiter';

  // Share modal state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<null | { id: string; title: string; company: string; location?: string }>(null);
  const [convs, setConvs] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [sendingShare, setSendingShare] = useState(false);
  const location = useLocation();
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);
  const [sharedJob, setSharedJob] = useState<null | any>(null);

  const openShare = async (job: { _id: string; title: string; company: string; location?: string }) => {
    setShareTarget({ id: job._id, title: job.title, company: job.company, location: job.location });
    setShareOpen(true);
    setSelectedConvId(null);
    try {
      setConvLoading(true);
      const connections = await userService.getConnections();
      setConvs(connections || []);
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to load conversations');
    } finally {
      setConvLoading(false);
    }
  };

  const sendShare = async () => {
    if (!selectedConvId || !shareTarget) return;
    try {
      setSendingShare(true);
      const link = `/jobs?jobId=${shareTarget.id}`;
      const content = `Check this job: ${shareTarget.company} - ${shareTarget.title}${shareTarget.location ? ' • ' + shareTarget.location : ''}\nOpen: ${link}`;
      // selectedConvId now holds the peerId (connection target)
      const conv = await chatService.startConversation([selectedConvId]);
      await chatService.sendMessage(conv._id, { content, type: 'text' });
      showSuccess('Job shared successfully');
      setShareOpen(false);
      setShareTarget(null);
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to share job');
    } finally {
      setSendingShare(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jobService.getMatchingJobs({ page: 1, limit: 50 });
        setMatches(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Parse deep-link jobId from query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('jobId');
    if (id) setHighlightedJobId(id);
  }, [location.search]);

  // When we have a highlighted id, scroll to it if present, otherwise fetch and show single card
  useEffect(() => {
    if (!highlightedJobId) return;
    const found = matches.some(m => m.job._id === highlightedJobId);
    if (found) {
      setTimeout(() => {
        const el = document.getElementById(`job-${highlightedJobId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      setSharedJob(null);
    } else {
      (async () => {
        try {
          const details = await jobService.getJobDetails(highlightedJobId);
          setSharedJob(details?.job || null);
          setTimeout(() => {
            const el = document.getElementById('shared-job-card');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        } catch (_) {
          // ignore
        }
      })();
    }
  }, [highlightedJobId, matches]);

  const handleApply = async (jobId: string) => {
    try {
      await jobService.applyToJob(jobId, {});
      showSuccess("Application submitted");
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || "Failed to apply");
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await jobService.saveJob(jobId);
      setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
      showSuccess(savedJobs.includes(jobId) ? 'Removed from saved' : 'Job saved');
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || "Failed to save job");
    }
  };

  const handleLoadMore = () => {
    setVisibleJobs(prev => prev + 5);
  };

  const handleFilter = (filterType: string) => {
    setActiveFilter(filterType);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
  };

  // Filtrer et trier les jobs
  const filteredAndSortedJobs = useMemo(() => {
    const list = matches
      .filter(m => activeFilter === "all" || m.job.category === activeFilter)
      .sort((a, b) => {
        switch (sortBy) {
          case "salary":
            return (b.job.salary?.max || 0) - (a.job.salary?.max || 0);
          case "recent":
            return new Date(b.job.createdAt || 0).getTime() - new Date(a.job.createdAt || 0).getTime();
          case "match":
          default:
            return (b.matchScore || 0) - (a.matchScore || 0);
        }
      });
    return list.slice(0, visibleJobs);
  }, [matches, activeFilter, sortBy, visibleJobs]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">
          Job Matcher & Airline Ranking
        </h1>
        <p className="text-gray-600 font-montessart text-lg max-w-2xl mx-auto">
          Discover airlines and positions perfectly matched to your profile
        </p>
      </div>

      {(currentUser?.role === 'recruiter' || currentUser?.role === 'admin') && (
        <div className="mb-6 flex justify-end">
          <Link
            to="/jobs/create"
            className="bg-[#423772] text-white px-5 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors"
          >
            Post a Job
          </Link>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#423772] rounded-full flex items-center justify-center mx-auto mb-2">
            <FiTrendingUp className="text-lg sm:text-xl text-white" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#423772] font-emirates">{matches.length}</p>
          <p className="text-gray-600 font-montessart text-xs sm:text-sm">Job Matches</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
          <p className="text-xl sm:text-2xl font-bold text-[#423772] font-emirates">92%</p>
          <p className="text-gray-600 font-montessart text-xs sm:text-sm">Best Match</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
          <p className="text-xl sm:text-2xl font-bold text-[#423772] font-emirates">$4,800</p>
          <p className="text-gray-600 font-montessart text-xs sm:text-sm">Highest Salary</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
          <p className="text-xl sm:text-2xl font-bold text-[#423772] font-emirates">15+</p>
          <p className="text-gray-600 font-montessart text-xs sm:text-sm">Airlines</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Position Type Filter */}
        <div className="flex-1 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="text-[#423772]" />
            <h3 className="font-semibold text-gray-800 font-montessart">Position Type</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                activeFilter === "all" 
                  ? "bg-[#423772] text-white hover:bg-[#312456]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Positions
            </button>
            <button
              onClick={() => handleFilter("flight-attendant")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                activeFilter === "flight-attendant" 
                  ? "bg-[#423772] text-white hover:bg-[#312456]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Flight Attendant
            </button>
            <button
              onClick={() => handleFilter("cabin-crew")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                activeFilter === "cabin-crew" 
                  ? "bg-[#423772] text-white hover:bg-[#312456]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cabin Crew
            </button>
            <button
              onClick={() => handleFilter("senior-crew")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                activeFilter === "senior-crew" 
                  ? "bg-[#423772] text-white hover:bg-[#312456]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Senior Crew
            </button>
          </div>
        </div>

        {/* Sort Filter */}
        <div className="flex-1 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FiTrendingUp className="text-[#423772]" />
            <h3 className="font-semibold text-gray-800 font-montessart">Sort By</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSort("match")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                sortBy === "match" 
                  ? "bg-[#6D5BA6] text-white hover:bg-[#5a4a8a]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Best Match
            </button>
            <button
              onClick={() => handleSort("salary")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                sortBy === "salary" 
                  ? "bg-[#6D5BA6] text-white hover:bg-[#5a4a8a]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Highest Salary
            </button>
            <button
              onClick={() => handleSort("recent")}
              className={`px-3 py-2 rounded-lg text-sm font-montessart font-medium transition-colors ${
                sortBy === "recent" 
                  ? "bg-[#6D5BA6] text-white hover:bg-[#5a4a8a]" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Most Recent
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 font-montessart">
          {loading ? "Loading jobs..." : error ? error : `Showing ${filteredAndSortedJobs.length} of ${matches.length} opportunities`}
        </p>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {sharedJob && (
          <div id="shared-job-card" className="flex flex-col lg:flex-row justify-between items-start bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-800 font-emirates">{sharedJob.company}</h2>
                <span className="text-xs bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full font-montessart font-medium">Shared Job</span>
              </div>
              <p className="text-lg font-semibold text-[#423772] font-montessart mb-1">{sharedJob.title}</p>
              <div className="flex items-center text-gray-600 font-montessart">
                <FiMapPin size={16} className="mr-2 text-[#423772]" />
                <span className="text-sm">{sharedJob.location}</span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <button 
                onClick={() => handleApply(sharedJob._id)}
                className="bg-[#423772] text-white px-4 py-2 rounded-lg font-montessart font-semibold text-sm hover:bg-[#312456] transition-colors whitespace-nowrap"
              >
                Apply Now
              </button>
            </div>
          </div>
        )}
        {filteredAndSortedJobs.map((m) => (
          <div 
            key={m.job._id}
            id={`job-${m.job._id}`}
            className={`flex flex-col lg:flex-row justify-between items-start bg-white border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#423772]/30 ${highlightedJobId === m.job._id ? 'border-[#423772] ring-2 ring-[#423772]/40' : 'border-gray-200'}`}
          >
            {/* Left Section - Job Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-800 font-emirates">
                      {m.job.company}
                    </h2>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-montessart font-medium">
                      {m.job.createdAt ? new Date(m.job.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-[#423772] font-montessart mb-1">
                    {m.job.title}
                  </p>
                </div>
                
                {/* Match Score Badge - Desktop (hide for recruiters) */}
                {currentUser?.role !== 'recruiter' && (
                  <div className="hidden lg:flex flex-col items-center ml-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg font-emirates">
                        {m.matchScore}%
                      </span>
                    </div>
                    <p className="text-gray-500 font-montessart text-xs mt-1">Match</p>
                  </div>
                )}
              </div>

              {/* Location and Salary */}
              <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 font-montessart mb-4 gap-2 sm:gap-6">
                <div className="flex items-center">
                  <FiMapPin size={16} className="mr-2 text-[#423772]" />
                  <span className="text-sm">{m.job.location}</span>
                </div>
                {m.job.salary && (
                  <div className="flex items-center">
                    <FiDollarSign size={16} className="mr-2 text-[#423772]" />
                    <span className="text-sm">${(m.job.salary.min).toLocaleString()}–${(m.job.salary.max).toLocaleString()}/{m.job.salary.period || 'month'}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(m.job.skills || []).slice(0,5).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-[#423772]/10 to-[#6D5BA6]/10 text-[#423772] text-xs px-3 py-1.5 rounded-full font-montessart font-medium border border-[#423772]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Section - Actions and Mobile Score */}
            <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto mt-4 lg:mt-0 lg:ml-6 gap-4">
              {/* Mobile Score (hide for recruiters) */}
              {currentUser?.role !== 'recruiter' && (
                <div className="lg:hidden flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm font-emirates">
                      {m.matchScore}%
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <div className="flex gap-2">
                  {!isRecruiter && (
                    <button 
                      onClick={() => handleSaveJob(m.job._id)}
                      className={`p-2 rounded-lg border transition-colors ${
                        savedJobs.includes(m.job._id)
                          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          : "bg-white border-gray-300 text-gray-600 hover:border-[#423772] hover:text-[#423772]"
                      }`}
                      title={savedJobs.includes(m.job._id) ? "Remove from saved" : "Save job"}
                    >
                      <FiHeart className={savedJobs.includes(m.job._id) ? "fill-current" : ""} />
                    </button>
                  )}
                  <button 
                    onClick={() => openShare(m.job)}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:border-[#423772] hover:text-[#423772] transition-colors"
                    title="Share job"
                  >
                    <FiShare2 />
                  </button>
                </div>
                {!isRecruiter && (
                  <button 
                    onClick={() => handleApply(m.job._id)}
                    className="bg-[#423772] text-white px-4 py-2 rounded-lg font-montessart font-semibold text-sm hover:bg-[#312456] transition-colors whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {visibleJobs < matches.length && (
        <div className="text-center mt-8">
          <button 
            onClick={handleLoadMore}
            className="bg-white text-[#423772] border border-[#423772] px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#423772] hover:text-white transition-colors"
          >
            Load More Opportunities ({Math.max(matches.length - visibleJobs, 0)} remaining)
          </button>
        </div>
      )}
      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShareOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 font-emirates mb-2">Share Job</h3>
            {shareTarget && (
              <p className="text-gray-600 font-montessart mb-4">{shareTarget.company} — {shareTarget.title}{shareTarget.location ? ` • ${shareTarget.location}` : ''}</p>
            )}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2 mb-4">
              {convLoading ? (
                <div className="text-gray-600 font-montessart p-3">Loading conversations...</div>
              ) : convs.length === 0 ? (
                <div className="text-gray-600 font-montessart p-3">No conversations yet.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {convs.map((c: any) => (
                    <li key={c._id} className={`p-3 cursor-pointer flex items-center justify-between ${selectedConvId === c.peerId ? 'bg-[#423772]/10' : 'hover:bg-gray-50'}`} onClick={() => setSelectedConvId(c.peerId)}>
                      <div className="min-w-0">
                        <p className="font-montessart font-semibold text-gray-800 truncate">{c.user?.name || 'Connection'}</p>
                        {c.user?.headline && (
                          <p className="text-gray-500 text-sm font-montessart truncate">{c.user.headline}</p>
                        )}
                      </div>
                      <input type="radio" checked={selectedConvId === c.peerId} readOnly className="ml-3" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShareOpen(false)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={sendShare} disabled={!selectedConvId || sendingShare} className="bg-[#423772] text-white px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-[#312456] transition-colors disabled:opacity-60">{sendingShare ? 'Sharing...' : 'Share'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default JobsPage;