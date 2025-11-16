// pages/CareerPage.tsx
import React, { useState, useRef, useEffect } from 'react';

import { 
  FiMessageCircle, 
  FiSend, 
  FiBook, 
  FiFileText,
  FiAward,
  FiPlayCircle
} from 'react-icons/fi';
import { getCareerResources, CareerMessage, CareerResource } from '../services/careerService';
import { aeroService } from '../services/aeroService';

const CareerPage: React.FC = () => {
  const [messages, setMessages] = useState<CareerMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'resources'>('chat');
  const [includeSources, setIncludeSources] = useState<boolean>(true);
  const [brief, setBrief] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resources = getCareerResources();

  // Message de bienvenue initial
  useEffect(() => {
    const welcomeMessage: CareerMessage = {
      id: '1',
      text: "Hello! I'm your Aviation Career Assistant. I can help you with:\n• Career path guidance\n• Interview preparation\n• CV optimization\n• Airline requirements\n• Training recommendations\n\nWhat would you like to know about your aviation career?",
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Ajouter le message de l'utilisateur
    const userMessage: CareerMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Obtenir la réponse de l'assistant (Aeronautics chatbot API)
      const { answer, sources } = await aeroService.chat({ question: inputMessage, include_sources: includeSources, brief });
      const text = includeSources && sources && sources.length > 0
        ? `${answer}\n\nSources:\n${sources.map((s) => `• ${s}`).join('\n')}`
        : answer;

      const assistantMessage: CareerMessage = {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting career advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getResourceIcon = (type: CareerResource['type']) => {
    switch (type) {
      case 'article': return <FiBook className="text-blue-500" />;
      case 'video': return <FiPlayCircle className="text-red-500" />;
      case 'course': return <FiAward className="text-green-500" />;
      case 'template': return <FiFileText className="text-purple-500" />;
      default: return <FiBook className="text-gray-500" />;
    }
  };

  const quickQuestions = [
    "CV tips for airlines?",
    "How to prepare for interviews?",
    "What are the requirements?",
    "Career progression path?",
    "Training programs needed?"
  ];

  return (
    
      <div className="w-full px-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-emirates font-bold text-black mb-3">
            Career Guide
          </h1>
          <p className="text-gray-600 font-montessart text-lg">
            Get personalized career guidance and resources for your aviation journey
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Chat & Resources */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex space-x-8 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-4 font-montessart font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-[#423772] text-[#423772]'
                    : 'text-gray-500 hover:text-[#423772]'
                }`}
              >
                <FiMessageCircle className="text-lg" />
                AI Career Assistant
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-4 font-montessart font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'resources'
                    ? 'border-b-2 border-[#423772] text-[#423772]'
                    : 'text-gray-500 hover:text-[#423772]'
                }`}
              >
                <FiBook className="text-lg" />
                Learning Resources ({resources.length})
              </button>
            </div>

            {activeTab === 'chat' ? (
              /* Chat Interface */
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Messages Container */}
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3/4 rounded-2xl p-4 ${
                          message.sender === 'user'
                            ? 'bg-[#423772] text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line font-montessart">
                          {message.text}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-4 max-w-3/4">
                        <div className="flex items-center gap-2 font-montessart">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions + Options */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 font-montessart mb-3">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question.replace('?', ''))}
                        className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-montessart hover:bg-gray-50 hover:border-[#423772] transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-2 text-sm font-montessart text-gray-700">
                      <input type="checkbox" checked={includeSources} onChange={(e) => setIncludeSources(e.target.checked)} />
                      Include sources
                    </label>
                    <label className="flex items-center gap-2 text-sm font-montessart text-gray-700">
                      <input type="checkbox" checked={brief} onChange={(e) => setBrief(e.target.checked)} />
                      Brief answer
                    </label>
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-3">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about CV tips, interviews, requirements, training..."
                      className="flex-1 border border-gray-300 rounded-xl p-3 font-montessart resize-none focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-[#423772] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-[#312456] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <FiSend className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Resources Tab */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#423772]/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 font-montessart">
                            {resource.title}
                          </h3>
                          <span className="text-xs text-gray-500 font-montessart capitalize">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                      {resource.duration && (
                        <span className="bg-[#423772] text-white px-2 py-1 rounded text-xs font-montessart font-medium">
                          {resource.duration}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 font-montessart text-sm mb-4">
                      {resource.description}
                    </p>
                    
                    <button className="w-full bg-[#423772] text-white py-2 rounded-lg font-montessart font-semibold hover:bg-[#312456] transition-colors">
                      Access Resource
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Career Stats & Tips */}
          <div className="lg:w-80 space-y-6">
            {/* Career Progress */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#423772] rounded-xl flex items-center justify-center">
                  <FiAward className="text-2xl text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 font-montessart">
                  Your Career Progress
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-montessart mb-1">
                    <span className="text-gray-600">CV Score</span>
                    <span className="text-[#423772] font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#423772] h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-montessart mb-1">
                    <span className="text-gray-600">Interview Readiness</span>
                    <span className="text-[#423772] font-semibold">70%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#423772] h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-montessart mb-1">
                    <span className="text-gray-600">Career Knowledge</span>
                    <span className="text-[#423772] font-semibold">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#423772] h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-2xl p-6 text-white">
              <h3 className="font-semibold font-montessart mb-3">Career Quick Tips</h3>
              <ul className="space-y-2 text-white/90 font-montessart text-sm">
                <li>• Tailor your CV for each airline application</li>
                <li>• Research airline values and culture</li>
                <li>• Practice common interview questions</li>
                <li>• Highlight customer service experience</li>
                <li>• Maintain professional social media</li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 font-montessart mb-3">Recommended Next Steps</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <p className="font-medium text-blue-800 font-montessart">Complete your CV analysis</p>
                  <p className="text-blue-600 text-sm font-montessart">Get personalized feedback</p>
                </button>
                <button className="w-full text-left p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                  <p className="font-medium text-green-800 font-montessart">Practice interview questions</p>
                  <p className="text-green-600 text-sm font-montessart">Use our AI simulator</p>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                  <p className="font-medium text-purple-800 font-montessart">Explore job opportunities</p>
                  <p className="text-purple-600 text-sm font-montessart">View matched positions</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default CareerPage;