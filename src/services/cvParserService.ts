// services/cvParserService.ts
import api from './api';

export interface CVParserResult {
  ok: boolean;
  output_file?: string;
  result?: {
    metadata?: {
      export_date?: string;
      version?: string;
      detected_language?: string;
    };
    cv_data?: {
      nom_complet?: string;
      intitule_poste?: string;
      contact?: {
        telephone?: string;
        email?: string;
        adresse?: string;
      };
      profil?: string;
      experiences?: Array<{
        poste?: string;
        entreprise?: string;
        periode?: string;
        details?: string[];
      }>;
      formations?: Array<{
        diplome?: string;
        intitule?: string;
        etablissement?: string;
        annee?: string;
      }>;
      competences?: string[];
      langues?: Array<string | { langue?: string; niveau?: string }>;
      centres_interet?: string[];
    };
    // Rétrocompatibilité avec l'ancien format
    extracted_text?: string;
    personal_info?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
    skills?: string[];
    experience?: Array<{
      title?: string;
      company?: string;
      duration?: string;
      description?: string;
    }>;
    education?: Array<{
      degree?: string;
      institution?: string;
      year?: string;
    }>;
    languages?: string[];
    certifications?: string[];
  };
  error?: string;
}

export interface CVParserListItem {
  filename: string;
  size: number;
  mtime: number;
}

/**
 * Analyser un CV via le backend CV Parser (OCR + extraction)
 */
export const analyzeCVParser = async (file: File): Promise<CVParserResult> => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez PDF, JPG ou PNG.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Fichier trop volumineux. Maximum 10MB.');
  }

  const formData = new FormData();
  formData.append('cv', file);

  try {
    const { data } = await api.post('/api/cv-parser/api/cv/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 
      error.message || 
      'Échec de l\'analyse du CV'
    );
  }
};

/**
 * Lister tous les CV analysés
 */
export const listAnalyzedCVs = async (): Promise<CVParserListItem[]> => {
  try {
    const { data } = await api.get('/api/cv-parser/api/cv/list');
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 
      'Impossible de récupérer la liste des CV'
    );
  }
};

/**
 * Récupérer un fichier d'analyse spécifique par son nom
 */
export const getAnalyzedCV = async (filename: string): Promise<any> => {
  try {
    const { data } = await api.get(`/api/cv-parser/api/cv/${filename}`);
    return data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 
      'Fichier d\'analyse introuvable'
    );
  }
};

/**
 * Vérifier la santé du service CV Parser
 */
export const checkCVParserHealth = async (): Promise<boolean> => {
  try {
    const { data } = await api.get('/api/cv-parser/api/health');
    return data.status === 'OK';
  } catch {
    return false;
  }
};

/**
 * Supprimer un CV analysé
 */
export const deleteAnalyzedCV = async (filename: string): Promise<void> => {
  try {
    await api.delete(`/api/cv-parser/api/cv/${filename}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || 
      'Impossible de supprimer le CV'
    );
  }
};
