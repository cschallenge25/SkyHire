// services/cvService.ts
import api from './api';

// Types utilisés par le front
export interface CVAnalysis {
  score: number;
  skills: string[];
  improvements: string[];
  missingKeywords: string[];
  overallFeedback: string;
}

// Upload réel via API Gateway → cv-service
export const uploadCVFile = async (file: File): Promise<{ success: boolean; fileId?: string }> => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Please upload PDF, DOC, or DOCX files.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size too large. Please upload files smaller than 5MB.');
  }

  const form = new FormData();
  form.append('cv', file);

  const { data } = await api.post('/api/cv/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const id = data?.data?.cv?.id || data?.data?.cv?._id;
  return { success: true, fileId: id };
};

// Upload avatar image via API Gateway → cv-service
export const uploadAvatarImage = async (file: File): Promise<string> => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    throw new Error('Only JPG, PNG, WEBP images are allowed');
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Image too large. Max 2MB.');
  }
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.post('/api/cv/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  const path: string = data?.data?.url;
  if (!path) throw new Error('Failed to upload avatar');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
};

// Récupérer l'analyse brute depuis le backend
export const getCVAnalysisRaw = async (cvId: string) => {
  const { data } = await api.get(`/api/cv/${cvId}/analysis`);
  return data?.data?.analysis;
};

// Polling jusqu'à ce que l'analyse soit prête (ou timeout)
export const pollCVAnalysis = async (cvId: string, timeoutMs = 30000, intervalMs = 1000): Promise<CVAnalysis> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const analysis = await getCVAnalysisRaw(cvId);
      if (analysis) {
        return mapAnalysisToFront(analysis);
      }
    } catch (e: any) {
      // 404 "not available yet" ⇒ continuer à poll
      const message = e?.response?.data?.message || '';
      if (!/not available/i.test(message)) {
        throw new Error(message || 'Failed to get CV analysis');
      }
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('CV analysis timeout. Please try again later.');
};

// Option helper: upload + poll en une seule fonction (si besoin)
export const analyzeCV = async (file: File): Promise<CVAnalysis> => {
  const { success, fileId } = await uploadCVFile(file);
  if (!success || !fileId) throw new Error('Upload failed');
  return await pollCVAnalysis(fileId);
};

// Mapping backend → Front shape attendu
const mapAnalysisToFront = (a: any): CVAnalysis => {
  return {
    score: a?.score ?? 0,
    skills: Array.isArray(a?.skills) ? a.skills : [],
    improvements: Array.isArray(a?.improvements) ? a.improvements : [],
    missingKeywords: a?.aviationMatch?.missingRequirements || [],
    overallFeedback: Array.isArray(a?.recommendations) && a.recommendations.length > 0
      ? a.recommendations[0]
      : 'Analysis complete.'
  };
};

// Récupérer tous les CV de l'utilisateur
export interface UserCV {
  _id: string;
  originalName: string;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  analysisStatus: 'pending' | 'completed' | 'failed';
  analysisScore?: number;
}

export const getUserCVs = async (): Promise<UserCV[]> => {
  try {
    const { data } = await api.get('/api/cv/');
    return data?.data?.cvs || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to get CVs');
  }
};

// Télécharger un CV
export const downloadCV = (filename: string): string => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${base}/uploads/cv/${filename}`;
};

// Supprimer un CV
export const deleteCV = async (cvId: string): Promise<void> => {
  await api.delete(`/api/cv/${cvId}`);
};