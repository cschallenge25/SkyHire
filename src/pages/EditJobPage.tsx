import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useToast } from '../context/ToastContext';

const EditJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    category: 'flight-attendant',
    type: 'full-time',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    period: 'monthly',
    description: ''
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await jobService.getJobDetails(id);
        const j = data?.job;
        setForm({
          title: j?.title || '',
          company: j?.company || '',
          location: j?.location || '',
          category: (j as any)?.category || 'flight-attendant',
          type: (j as any)?.type || 'full-time',
          salaryMin: String((j as any)?.salary?.min ?? ''),
          salaryMax: String((j as any)?.salary?.max ?? ''),
          currency: (j as any)?.salary?.currency || 'USD',
          period: (j as any)?.salary?.period || 'monthly',
          description: (j as any)?.description || ''
        });
      } catch (e: any) {
        showError(e?.response?.data?.message || e?.message || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!form.title || !form.company || !form.location || !form.category || !form.description || !form.salaryMin || !form.salaryMax) {
      showError('Please fill all required fields');
      return;
    }
    const min = Number(form.salaryMin);
    const max = Number(form.salaryMax);
    if (Number.isNaN(min) || Number.isNaN(max) || min <= 0 || max <= 0 || max < min) {
      showError('Please enter a valid salary range');
      return;
    }
    try {
      setIsSubmitting(true);
      await jobService.updateJob(id, {
        title: form.title,
        company: form.company,
        location: form.location,
        category: form.category,
        type: form.type,
        salary: { min, max, currency: form.currency, period: form.period },
        description: form.description,
      } as any);
      showSuccess('Job updated successfully');
      navigate('/jobs/my');
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to update job');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
        <div className="text-gray-600 font-montessart">Loading job...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">Edit Job</h1>
        <p className="text-gray-600 font-montessart text-lg">Update your job posting</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Job Title</label>
            <input name="title" value={form.title} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Company</label>
            <input name="company" value={form.company} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Location</label>
            <input name="location" value={form.location} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Category</label>
            <select name="category" value={form.category} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all">
              <option value="flight-attendant">Flight Attendant</option>
              <option value="cabin-crew">Cabin Crew</option>
              <option value="pilot">Pilot</option>
              <option value="ground-staff">Ground Staff</option>
              <option value="management">Management</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Type</label>
            <select name="type" value={form.type} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all">
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Salary Min</label>
            <input name="salaryMin" value={form.salaryMin} onChange={onChange} type="number" className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Salary Max</label>
            <input name="salaryMax" value={form.salaryMax} onChange={onChange} type="number" className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Currency</label>
            <select name="currency" value={form.currency} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="AED">AED</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Period</label>
            <select name="period" value={form.period} onChange={onChange} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={6} className="w-full border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all resize-none" />
        </div>

        <div className="flex justify-end">
          <button disabled={isSubmitting} type="submit" className="bg-[#423772] text-white px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors disabled:opacity-60">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;
