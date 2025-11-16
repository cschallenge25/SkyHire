import React, { useEffect, useState } from "react";
import { FiSearch, FiMessageCircle, FiCheck, FiUserPlus, FiUsers, FiClock, FiSend, FiX } from "react-icons/fi";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { chatService } from "../services/chatService";
import { useNavigate } from 'react-router-dom';

const NetworkPage: React.FC = () => {
  const { showSuccess, showInfo, showError } = useToast();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState<'connections' | 'discover'>('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [discoverProfiles, setDiscoverProfiles] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Handlers pour les interactions
  const initials = (name?: string) => (name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const [conns, reqs, search] = await Promise.all([
        userService.getConnections(),
        userService.getPendingRequests(),
        userService.searchUsers({ limit: 12 })
      ]);
      const mappedConns = (conns || []).map((c: any) => ({
        id: c.user?._id || c.peerId,
        name: c.user?.name || 'Aviation Professional',
        position: c.user?.headline || '',
        airline: c.user?.location || '',
        connected: true,
        avatar: initials(c.user?.name),
        updatedAt: c.updatedAt,
      }));
      const mappedReqs = (reqs || []).map((r: any) => ({
        id: r._id,
        requesterId: r.user?._id || r.requester,
        name: r.user?.name || 'Aviation Professional',
        position: r.user?.headline || '',
        airline: r.user?.location || '',
        avatar: initials(r.user?.name),
      }));
      const mappedDiscover = (search.users || [])
        .filter((u: any) => u.userId !== currentUser?.id)
        .map((u: any) => ({
          id: u.userId,
          name: u.name || u.headline || 'Aviation Professional',
          position: '',
          airline: u.location || '',
          mutual: 0,
          avatar: initials(u.name || u.headline),
        }));
      setConnections(mappedConns);
      setPendingRequests(mappedReqs);
      setDiscoverProfiles(mappedDiscover);
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to load network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadMsg = async () => {
      try {
        const { conversations } = await chatService.getConversations({ limit: 50 });
        const total = (conversations || []).reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setUnreadMessages(total);
      } catch {
        setUnreadMessages(0);
      }
    };
    loadMsg();
  }, []);

  const handleConnect = async (personId: any) => {
    try {
      const person = discoverProfiles.find(p => p.id === personId);
      await userService.sendConnectionRequest(String(personId));
      showSuccess(`Connection request sent to ${person?.name || 'user'}`);
      setDiscoverProfiles(prev => prev.filter(p => p.id !== personId));
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to send request');
    }
  };

  const handleMessage = (personId: any) => {
    const person = connections.find(p => p.id === personId);
    if (person) {
      navigate(`/chat/${personId}`);
    }
  };

  const handleAcceptRequest = async (requestId: any) => {
    try {
      await userService.acceptConnection(String(requestId));
      showSuccess('Connected successfully');
      await loadNetwork();
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to accept');
    }
  };

  const handleRejectRequest = async (requestId: any) => {
    try {
      await userService.rejectConnection(String(requestId));
      showInfo('Request declined');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Failed to decline');
    }
  };

  const handleFindConnections = () => {
    setActiveTab('discover');
    // Scroll vers la section discover
    setTimeout(() => {
      document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filtrer les résultats basés sur la recherche
  const filteredConnections = connections.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.airline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDiscover = discoverProfiles.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.airline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Derived stats
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeThisWeekCount = connections.filter((c: any) => c.updatedAt && new Date(c.updatedAt) >= weekAgo).length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">
          Networking Platform
        </h1>
        <p className="text-gray-600 font-montessart text-lg max-w-2xl mx-auto">
          Connect with aviation professionals, mentors, and recruiters
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="relative mb-8">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search professionals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl pl-12 pr-4 py-4 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 sm:space-x-8 border-b border-gray-200 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('connections')}
              className={`pb-4 font-montessart font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'connections'
                  ? 'border-b-2 border-[#423772] text-[#423772]'
                  : 'text-gray-500 hover:text-[#423772]'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-4 font-montessart font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'discover'
                  ? 'border-b-2 border-[#423772] text-[#423772]'
                  : 'text-gray-500 hover:text-[#423772]'
              }`}
            >
              Discover ({discoverProfiles.length})
            </button>
          </div>

          {/* Connections/Discover List */}
          <div className="space-y-6" id={activeTab === 'discover' ? 'discover-section' : undefined}>
            {(activeTab === 'connections' ? filteredConnections : filteredDiscover).map((person) => (
              <div 
                key={person.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#423772]/30"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-2xl flex items-center justify-center text-white font-bold text-lg font-emirates">
                    {person.avatar}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 font-montessart">
                      {person.name}
                    </h3>
                    <p className="text-gray-600 font-montessart">
                      {person.position}
                    </p>
                    <p className="text-gray-500 font-montessart text-sm flex items-center gap-2">
                      <FiSend className="text-[#423772]" />
                      {person.airline}
                    </p>
                    {'mutual' in person && (
                      <p className="text-[#423772] font-montessart text-sm font-medium">
                        {person.mutual} mutual connections
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  {activeTab === 'connections' ? (
                    <button 
                      onClick={() => handleMessage(person.id)}
                      className="flex items-center gap-2 bg-[#423772] text-white px-4 sm:px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors whitespace-nowrap"
                    >
                      <FiMessageCircle className="text-lg" />
                      Message
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleConnect(person.id)}
                      className="flex items-center gap-2 bg-[#423772] text-white px-4 sm:px-6 py-3 rounded-xl font-montessart font-semibold hover:bg-[#312456] transition-colors whitespace-nowrap"
                    >
                      <FiUserPlus className="text-lg" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {(activeTab === 'connections' ? filteredConnections.length === 0 : filteredDiscover.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <FiUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-montessart text-lg">
                  {searchTerm ? 'No results found' : `No ${activeTab === 'connections' ? 'connections' : 'profiles to discover'}`}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-[#423772] font-montessart font-semibold mt-2 hover:text-[#312456] transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Network Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#423772] rounded-xl flex items-center justify-center">
                <FiUsers className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 font-montessart">
                Your Network
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montessart">Total Connections</span>
                <span className="text-2xl font-bold text-[#423772] font-emirates">{connections.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montessart">Active This Week</span>
                <span className="text-xl font-bold text-green-600 font-emirates">{activeThisWeekCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-montessart">Messages</span>
                <span className="text-xl font-bold text-blue-600 font-emirates">{unreadMessages}</span>
              </div>
            </div>
          </div>

          {/* Connection Requests */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <FiClock className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 font-montessart">
                Connection Requests
              </h2>
            </div>

            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-xl flex items-center justify-center text-white font-bold text-sm font-emirates">
                      {request.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 font-montessart text-sm">
                        {request.name}
                      </p>
                      <p className="text-gray-600 font-montessart text-xs">
                        {request.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(request.id)}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                      title="Accept"
                    >
                      <FiCheck className="text-sm sm:text-lg" />
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 rounded-xl flex items-center justify-center text-white hover:bg-gray-500 transition-colors"
                      title="Decline"
                    >
                      <FiX className="text-sm sm:text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pendingRequests.length === 0 && (
              <p className="text-gray-500 font-montessart text-center py-4 text-sm">
                No pending requests
              </p>
            )}
          </div>
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-2xl p-6 text-white">
            <h3 className="font-semibold font-montessart mb-3">Grow Your Network</h3>
            <p className="text-white/80 font-montessart text-sm mb-4">
              Connect with professionals to advance your aviation career
            </p>
            <button 
              onClick={handleFindConnections}
              className="w-full bg-white text-[#423772] py-3 rounded-xl font-montessart font-semibold hover:bg-gray-100 transition-colors"
            >
              Find Connections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;