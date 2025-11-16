// pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { FiMail, FiMapPin, FiPhone, FiEdit2, FiSave, FiAward, FiGlobe, FiDownload, FiTrash2, FiFileText } from 'react-icons/fi';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { listAnalyzedCVs, deleteAnalyzedCV, CVParserListItem } from '../services/cvParserService';
import { useToast } from '../context/ToastContext';

const ProfilePage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar] = useState<string | undefined>(authService.getCurrentUser()?.avatar);
  const [profile, setProfile] = useState({
    name: 'Loading...',
    email: '',
    position: 'Flight Attendant Candidate',
    location: '',
    phone: '',
    bio: '',
    skills: [] as string[],
    languages: [] as string[],
    experience: '',
    cv: undefined as any
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [uploadedCVs, setUploadedCVs] = useState<CVParserListItem[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);

  const handleSave = async () => {
    setIsEditing(false);
    try {
      const current = authService.getCurrentUser();
      if (current && profile.name && profile.name !== current.name) {
        await authService.updateProfile({ name: profile.name });
      }
      await userService.updateProfile({
        headline: profile.position,
        bio: profile.bio,
        location: profile.location,
        phone: profile.phone,
        languages: profile.languages.map((l: any) => (
          typeof l === 'string' 
            ? { language: l, proficiency: 'fluent' } 
            : l
        )),
        // Remplacer la liste des compétences côté backend
        skills: profile.skills.map((s: any) => ({ name: typeof s === 'string' ? s : s?.name }))
      } as any);
      showSuccess('Profile updated successfully!');
    } catch (e: any) {
      showError(e?.message || 'Failed to update profile');
    }
  };


  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const current = authService.getCurrentUser();
        const p = await userService.getProfile();
        setProfile(prev => ({
          ...prev,
          name: current?.name || p.name || prev.name,
          email: current?.email || p.email || prev.email,
          position: p.headline || prev.position,
          location: p.location || '',
          phone: p.phone || '',
          bio: p.bio || '',
          skills: Array.isArray(p.skills) ? (p.skills as any[]).map((s: any) => s?.name || s) : [],
          languages: Array.isArray(p.languages) ? (p.languages as any[]).map((l: any) => l?.language || l) : [],
          cv: (p as any)?.cv
        }));
      } catch (_) {
        // ignore for now
      }
    };
    load();
    fetchUploadedCVs();
  }, []);

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage)) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageToRemove)
    }));
  };

  const fetchUploadedCVs = async () => {
    try {
      setLoadingCVs(true);
      console.log('🔍 Fetching analyzed CVs from cv_parser...');
      const cvs = await listAnalyzedCVs();
      console.log('✅ CVs fetched:', cvs);
      setUploadedCVs(cvs);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des CVs:', error);
      if ((error as any)?.response) {
        console.error('Response status:', (error as any).response.status);
        console.error('Response data:', (error as any).response.data);
      }
    } finally {
      setLoadingCVs(false);
    }
  };

  const handleDownloadCV = (filename: string) => {
    // Ouvrir le fichier JSON analysé dans un nouvel onglet
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const downloadUrl = `${apiUrl}/api/cv-parser/api/cv/${filename}`;
    window.open(downloadUrl, '_blank');
  };

  const handleDeleteCV = async (filename: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce CV ?')) {
      return;
    }
    
    try {
      console.log('🗑️  Deleting CV:', filename);
      await deleteAnalyzedCV(filename);
      showSuccess('CV supprimé avec succès');
      fetchUploadedCVs(); // Rafraîchir la liste
    } catch (error) {
      showError('Erreur lors de la suppression du CV');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">
          My Profile
        </h1>
        <p className="text-gray-600 font-montessart text-lg">
          Manage your professional information and career details
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 font-emirates">
                Personal Information
              </h2>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="flex items-center gap-2 bg-[#423772] text-white px-4 py-2 rounded-lg font-montessart font-semibold hover:bg-[#312456] transition-colors"
              >
                {isEditing ? <FiSave className="text-lg" /> : <FiEdit2 className="text-lg" />}
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center lg:items-start space-y-4">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-2xl flex items-center justify-center text-white font-bold text-4xl font-emirates shadow-lg">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                {/* Change Photo removed as requested */}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-xl p-3 font-montessart disabled:bg-gray-100 disabled:text-gray-600 focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-3 font-montessart disabled:bg-gray-100 disabled:text-gray-600 focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                    Current Position
                  </label>
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-xl p-3 font-montessart disabled:bg-gray-100 disabled:text-gray-600 focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                  <FiMapPin className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-xl p-3 font-montessart disabled:bg-gray-100 disabled:text-gray-600 focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                  <FiPhone className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-xl p-3 font-montessart disabled:bg-gray-100 disabled:text-gray-600 focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 font-montessart mb-2">
                Professional Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                disabled={!isEditing}
                rows={4}
                className="w-full border border-gray-300 rounded-xl p-3 font-montessart disabled:bg-gray-100 disabled:text-gray-600 focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#423772] rounded-xl flex items-center justify-center">
                <FiAward className="text-2xl text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 font-emirates">
                Skills & Expertise
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-[#423772]/10 to-[#6D5BA6]/10 text-[#423772] px-3 py-2 rounded-lg font-montessart font-medium border border-[#423772]/20 flex items-center gap-2"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill..."
                  className="flex-1 border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  onClick={addSkill}
                  className="bg-[#423772] text-white px-4 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Languages Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <FiGlobe className="text-2xl text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 font-emirates">
                Languages
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.languages.map((language, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-800 px-3 py-2 rounded-lg font-montessart font-medium border border-green-500/20 flex items-center gap-2"
                >
                  {language}
                  {isEditing && (
                    <button
                      onClick={() => removeLanguage(language)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a new language..."
                  className="flex-1 border border-gray-300 rounded-xl p-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                />
                <button
                  onClick={addLanguage}
                  className="bg-green-500 text-white px-4 py-3 rounded-xl font-montessart font-semibold hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* CV Analysis Summary */}
          {profile.cv?.parsedData && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 font-montessart">CV Analysis</h3>
                {profile.cv.outputFileName && (
                  <a
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cv-parser/result/${profile.cv.outputFileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-[#423772] text-white px-3 py-1 rounded-md hover:bg-[#312456] transition-colors flex items-center gap-1"
                  >
                    <FiGlobe className="text-sm" />
                    View JSON
                  </a>
                )}
              </div>
              <div className="space-y-2 text-sm font-montessart">
                {profile.cv.originalFileName && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                    <p className="text-gray-700 text-xs">
                      <span className="font-semibold">Original File:</span>
                    </p>
                    <p className="text-blue-800 truncate">{profile.cv.originalFileName}</p>
                  </div>
                )}
                {profile.cv.parsedData.nom_complet && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Name:</span> {profile.cv.parsedData.nom_complet}
                  </p>
                )}
                {profile.cv.parsedData.contact?.email && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Email:</span> {profile.cv.parsedData.contact.email}
                  </p>
                )}
                {Array.isArray(profile.cv.parsedData.competences) && profile.cv.parsedData.competences.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700">Top Skills:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.cv.parsedData.competences.slice(0,6).map((s: any, i: number) => (
                          <span key={i} className="bg-purple-50 text-[#423772] px-2 py-1 rounded-md border border-purple-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                )}
                {profile.cv.analyzedAt && (
                  <p className="text-gray-500 text-xs mt-2">Analyzed: {new Date(profile.cv.analyzedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
          {/* Profile Completion */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 font-montessart mb-4">Profile Completion</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm font-montessart mb-1">
                  <span>Basic Information</span>
                  <span className="text-green-600 font-semibold">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-montessart mb-1">
                  <span>Skills & Languages</span>
                  <span className="text-[#423772] font-semibold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#423772] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-montessart mb-1">
                  <span>Experience Details</span>
                  <span className="text-yellow-600 font-semibold">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-2xl p-6 text-white">
            <h3 className="font-semibold font-montessart mb-4">Profile Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-montessart">Profile Views</span>
                <span className="font-emirates font-bold">128</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-montessart">Connections</span>
                <span className="font-emirates font-bold">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-montessart">Last Updated</span>
                <span className="font-emirates font-bold">Today</span>
              </div>
            </div>
          </div>

          {/* Uploaded CVs Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 font-montessart">Mes CVs Uploadés</h3>
              <span className="bg-[#423772] text-white text-xs px-2 py-1 rounded-full">
                {uploadedCVs.length}
              </span>
            </div>
            
            {loadingCVs ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#423772] mx-auto"></div>
              </div>
            ) : uploadedCVs.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FiFileText className="mx-auto text-4xl mb-2 opacity-30" />
                <p className="text-sm">Aucun CV uploadé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedCVs.map((cv, index) => {
                  // Extraire le nom original du fichier (enlever _analyzed.json)
                  const displayName = cv.filename.replace(/_analyzed\.json$/, '');
                  const uploadDate = new Date(cv.mtime);
                  
                  return (
                    <div key={cv.filename} className="border border-gray-200 rounded-lg p-4 hover:border-[#423772] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate font-montessart">
                            {displayName}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{(cv.size / 1024).toFixed(0)} KB</span>
                            <span>•</span>
                            <span>{uploadDate.toLocaleDateString('fr-FR')} à {uploadDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            ✅ Analysé
                          </span>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => handleDownloadCV(cv.filename)}
                            className="p-2 text-[#423772] hover:bg-[#423772] hover:text-white rounded-lg transition-colors"
                            title="Voir l'analyse JSON"
                          >
                            <FiDownload className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDeleteCV(cv.filename)}
                            className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;