import api from './api';

export type JobModel = {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  salary?: { min: number; max: number; currency?: string; period?: string };
  skills?: string[];
  createdAt?: string;
};

export type MatchingJob = {
  job: JobModel;
  matchScore: number;
  matchDetails?: any;
  recommendations?: string[];
};

export type ApplicationSummary = {
  _id: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedAt?: string;
  matchScore?: number;
  job: JobModel;
};

export type RecruiterJob = JobModel & { stats?: { applications?: number; views?: number; saves?: number } };
export type JobApplication = {
  _id: string;
  status: ApplicationSummary['status'];
  appliedAt?: string;
  matchScore?: number;
  user?: { name: string; email: string };
};

export const jobService = {
  async getMatchingJobs(params: Partial<{ page: number; limit: number; category: string; type: string; location: string; minSalary: number; experience: string; remote: boolean; }>): Promise<MatchingJob[]> {
    const { data } = await api.get('/api/jobs/user/matching', { params });
    return data?.data?.jobs || [];
  },

  async getAllJobs(params: Partial<{ page: number; limit: number; search: string; category: string; type: string; location: string; minSalary: number; experience: string; remote: boolean; sortBy: string; sortOrder: 'asc' | 'desc'; }>): Promise<{ jobs: JobModel[]; total: number; page: number; pages: number; }> {
    const { data } = await api.get('/api/jobs', { params });
    const payload = data?.data || {};
    return { jobs: payload.jobs || [], total: payload.pagination?.total || 0, page: payload.pagination?.page || 1, pages: payload.pagination?.pages || 1 };
  },

  async getJobDetails(id: string): Promise<{ job: JobModel; hasApplied: boolean; applicationId?: string; }> {
    const { data } = await api.get(`/api/jobs/${id}`);
    return data?.data;
  },

  async applyToJob(id: string, payload: { coverLetter?: string; answers?: any; cvId?: string }): Promise<any> {
    const { data } = await api.post(`/api/jobs/${id}/apply`, payload);
    return data;
  },

  async saveJob(id: string): Promise<any> {
    const { data } = await api.post(`/api/jobs/${id}/save`);
    return data;
  },

  async getMyApplications(params: Partial<{ page: number; limit: number; status: string }>): Promise<{ applications: ApplicationSummary[]; total: number; page: number; pages: number; }> {
    const { data } = await api.get('/api/jobs/user/applications', { params });
    const payload = data?.data || {};
    const list: any[] = payload.applications || [];
    const applications: ApplicationSummary[] = list.map((a: any) => ({
      _id: a?._id,
      status: a?.status,
      appliedAt: a?.appliedAt || a?.createdAt,
      matchScore: a?.matchScore,
      job: a?.jobId,
    }));
    return {
      applications,
      total: payload.pagination?.total || 0,
      page: payload.pagination?.page || 1,
      pages: payload.pagination?.pages || 1,
    };
  },

  async createJob(payload: Partial<{ title: string; company: string; location: string; category: string; type: string; salary: { min: number; max: number; currency?: string; period?: string }; description: string; requirements: string[]; responsibilities: string[]; benefits: string[]; skills: string[]; experience: string; education: string[]; languages: Array<{ language: string; proficiency: string }>; applicationDeadline: string; isRemote: boolean; visaSponsorship: boolean; relocationAssistance: boolean; contact: { email?: string; phone?: string; website?: string } }>): Promise<any> {
    const { data } = await api.post('/api/jobs', payload);
    return data;
  },

  async updateJob(id: string, payload: Partial<{ title: string; company: string; location: string; category: string; type: string; salary: { min: number; max: number; currency?: string; period?: string }; description: string; requirements: string[]; responsibilities: string[]; benefits: string[]; skills: string[]; experience: string; education: string[]; languages: Array<{ language: string; proficiency: string }>; applicationDeadline: string; isRemote: boolean; visaSponsorship: boolean; relocationAssistance: boolean; contact: { email?: string; phone?: string; website?: string } }>): Promise<any> {
    const { data } = await api.put(`/api/jobs/${id}`, payload);
    return data;
  },

  async deleteJob(id: string): Promise<any> {
    const { data } = await api.delete(`/api/jobs/${id}`);
    return data;
  },

  async getCategories(): Promise<Array<{ name: string; count: number; label: string }>> {
    const { data } = await api.get('/api/jobs/categories');
    return data?.data?.categories || [];
  },

  // Recruiter endpoints
  async getMyJobs(params: Partial<{ page: number; limit: number }>): Promise<{ jobs: RecruiterJob[]; total: number; page: number; pages: number; }> {
    const { data } = await api.get('/api/jobs/my', { params });
    const payload = data?.data || {};
    return { jobs: payload.jobs || [], total: payload.pagination?.total || 0, page: payload.pagination?.page || 1, pages: payload.pagination?.pages || 1 };
  },

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    const { data } = await api.get(`/api/jobs/${jobId}/applications`);
    const list: any[] = data?.data?.applications || [];
    return list.map(a => ({
      _id: a?._id,
      status: a?.status,
      appliedAt: a?.appliedAt || a?.createdAt,
      matchScore: a?.matchScore,
      user: a?.userId,
    }));
  },

  async updateApplicationStatus(applicationId: string, status: ApplicationSummary['status'], notes?: string): Promise<any> {
    const { data } = await api.patch(`/api/jobs/applications/${applicationId}/status`, { status, notes });
    return data;
  },

  async addApplicationCommunication(applicationId: string, payload: Partial<{ type: string; subject: string; content: string; from: string; to: string; }>): Promise<any> {
    const { data } = await api.post(`/api/jobs/applications/${applicationId}/communication`, payload);
    return data;
  },
};

