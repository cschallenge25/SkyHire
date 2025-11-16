import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiRotateCcw } from 'react-icons/fi';
import { MdWorkOutline } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'CV Score', value: '85%', color: 'text-[#423772]', icon: <FiFileText className="text-3xl text-[#423772]" /> },
    { label: 'Interviews Completed', value: '12', color: 'text-[#2b2467]', icon: <HiOutlineAcademicCap className="text-3xl text-[#2b2467]" /> },
    { label: 'Job Matches', value: '8', color: 'text-[#5b4b9a]', icon: <MdWorkOutline className="text-3xl text-[#5b4b9a]" /> },
  ];

  const activities = [
    {
      icon: <FiCheckCircle className="text-green-500 text-lg" />,
      text: 'CV analyzed successfully (85%)',
    },
    {
      icon: <HiOutlineAcademicCap className="text-blue-500 text-lg" />,
      text: 'Interview practice completed (92%)',
    },
    {
      icon: <FiRotateCcw className="text-[#423772] text-lg" />,
      text: '3 new job matches found',
    },
  ];

  return (
    
      <div className="max-w-6xl mx-auto px-10 py-10">
        {/* Titre principal */}
        <h2 className="text-3xl font-bold mb-8 text-black font-emirates text-center">
          Dashboard
        </h2>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="mb-4">{stat.icon}</div>
              <p className="text-gray-600 font-montessart text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color} font-emirates`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Section de bienvenue */}
        <div className="bg-gradient-to-r from-[#423772] to-[#7b6bd0] p-8 rounded-2xl shadow-md text-white mb-12">
          <h3 className="text-2xl font-bold mb-3 font-emirates">
            Welcome to SkyHire!
          </h3>
          <p className="font-montessart text-white text-opacity-90 text-sm">
            Your premier aviation career platform. Upload your CV, practice with AI interviews,
            and discover exclusive flight opportunities designed for your professional growth.
          </p>
        </div>

        {/* Actions rapides et activité récente alignées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-[#423772] mb-4 font-emirates text-lg text-center">
                Quick Actions
              </h4>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/cv')}
                  className="w-full bg-[#423772] text-white py-3 rounded-lg hover:bg-[#312456] transition-colors font-montessart text-sm"
                >
                  Upload Your CV
                </button>
                <button 
                  onClick={() => navigate('/interview')}
                  className="w-full border border-[#423772] text-[#423772] py-3 rounded-lg hover:bg-[#423772] hover:text-white transition-colors font-montessart text-sm"
                >
                  Start Interview Practice
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h4 className="font-semibold text-[#423772] mb-4 font-emirates text-lg text-center">
              Recent Activity
            </h4>
            <div className="space-y-3 font-montessart text-gray-700">
              {activities.map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  {act.icon}
                  <p className="text-sm">{act.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Dashboard;