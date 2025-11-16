// pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiSearch, FiSend, FiUser } from 'react-icons/fi';

import { chatService } from '../services/chatService';
import { authService } from '../services/authService';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  read: boolean;
}

interface Contact {
  id: string;
  peerId?: string;
  name: string;
  position: string;
  airline: string;
  avatar: string;
  lastMessage: string;
  lastActive: string;
  unread: number;
}

const ChatPage: React.FC = () => {
  const { userId } = useParams();
  const currentUser = authService.getCurrentUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Socket.IO connection
  useEffect(() => {
    const token = authService.getToken();
    const url = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const socket = io(url, {
      path: '/socket.io/chat',
      auth: { token: token || '' },
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-conversations');
    });

    socket.on('new-message', (payload: any) => {
      if (!payload || !payload.message) return;
      const { conversationId, message } = payload;
      setMessages(prev => {
        if (conversationId !== selectedConversationId) return prev;
        const mapped: Message = {
          id: message._id,
          text: message.content,
          sender: ((message.sender && message.sender._id) === currentUser?.id) ? 'user' : 'contact',
          timestamp: new Date(message.createdAt || Date.now()),
          read: true
        };
        return [...prev, mapped];
      });
    });

    return () => {
      try { socket.disconnect(); } catch (_) {}
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simuler des messages initiaux
  useEffect(() => {
    const load = async () => {
      try {
        const { conversations } = await chatService.getConversations();
        const mapped = conversations.map(conv => {
          const otherParticipant = conv.participants.find((p: any) => (p.userId || p.user?._id) !== currentUser?.id) || conv.participants[0];
          const otherId = otherParticipant?.userId || otherParticipant?.user?._id;
          const name = otherParticipant?.user?.name || 'Aviation Professional';
          const initials = (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() || 'U';
          return {
            id: conv._id,
            peerId: otherId,
            name,
            position: '',
            airline: '',
            avatar: initials,
            lastMessage: conv.lastMessage?.content || '',
            lastActive: conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleString() : '',
            unread: conv.unreadCount || 0
          } as Contact;
        });
        // Deduplicate by peerId (keep most recent)
        const byPeer = new Map<string, Contact>();
        mapped.forEach(c => {
          const key = c.peerId || c.id;
          const prev = byPeer.get(key);
          const t = c.lastActive ? new Date(c.lastActive).getTime() : 0;
          const pt = prev?.lastActive ? new Date(prev.lastActive).getTime() : 0;
          if (!prev || t >= pt) byPeer.set(key, c);
        });
        const unique = Array.from(byPeer.values());
        setContacts(unique);

        let initial: Contact | null = null;
        if (userId) {
          initial = unique.find(c => c.peerId === userId) || null;

          if (!initial) {
            // start a new conversation with this user
            try {
              const conv = await chatService.startConversation([userId]);
              const otherParticipant = conv.participants.find((p: any) => (p.userId || p.user?._id) !== currentUser?.id) || conv.participants[0];
              const otherId = otherParticipant?.userId || otherParticipant?.user?._id;
              const name = otherParticipant?.user?.name || 'Aviation Professional';
              const initials = (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() || 'U';
              initial = {
                id: conv._id,
                peerId: otherId,
                name,
                position: '',
                airline: '',
                avatar: initials,
                lastMessage: conv.lastMessage?.content || '',
                lastActive: conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleString() : '',
                unread: conv.unreadCount || 0
              };
              setContacts(prev => [initial as Contact, ...prev]);
            } catch (_) {
              // ignore
            }
          }
        }

        if (!initial) initial = mapped[0] || null;
        if (initial) {
          setSelectedContact(initial);
          setSelectedConversationId(initial.id);
          await loadMessages(initial.id);
        }
      } catch (e) {
        // noop
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = async (conversationId: string) => {
    const { messages } = await chatService.getMessages(conversationId);
    const mapped: Message[] = messages.map(m => ({
      id: m._id,
      text: m.content,
      sender: (m.sender && (m.sender as any)._id) === currentUser?.id ? 'user' : 'contact',
      timestamp: new Date(m.createdAt),
      read: true
    }));
    setMessages(mapped);
  };

  // Scroll vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedContact || !selectedConversationId) return;

    const content = inputMessage;
    setInputMessage('');
    try {
      const sent = await chatService.sendMessage(selectedConversationId, { content, type: 'text' });
      const mapped: Message = {
        id: sent._id,
        text: sent.content,
        sender: 'user',
        timestamp: new Date((sent as any).createdAt || Date.now()),
        read: true
      };
      setMessages(prev => [...prev, mapped]);
    } catch (_) {
      // ignore
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (text: string, isUser: boolean) => {
    const lines = text.split('\n');
    return (
      <div className="font-montessart">
        {lines.map((line, idx) => {
          const openPrefix = 'Open:';
          if (line.trim().startsWith(openPrefix)) {
            const to = line.replace(openPrefix, '').trim();
            return (
              <div key={idx} className="mt-1">
                <Link to={to} className={isUser ? 'underline text-white' : 'underline text-[#423772]'}>
                  View job
                </Link>
              </div>
            );
          }
          return (
            <div key={idx} className="whitespace-pre-wrap">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-emirates font-bold text-black mb-3">
          Messages
        </h1>
        <p className="text-gray-600 font-montessart text-lg">
          Connect and chat with your aviation network
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Contacts Sidebar */}
        <div className="lg:w-80 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 font-montessart focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => { setSelectedContact(contact); setSelectedConversationId(contact.id); loadMessages(contact.id); if (socketRef.current) { socketRef.current.emit('join-conversation', contact.id); } }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                  selectedContact?.id === contact.id
                    ? 'bg-[#423772]/10 border-l-4 border-l-[#423772]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-xl flex items-center justify-center text-white font-bold font-emirates">
                    {contact.avatar}
                  </div>
                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800 font-montessart truncate">
                        {contact.name}
                      </h3>
                      {contact.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-montessart font-semibold">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 font-montessart text-sm truncate">
                      {contact.lastMessage}
                    </p>
                    <p className="text-gray-400 font-montessart text-xs mt-1">
                      {contact.lastActive}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#423772] to-[#6D5BA6] rounded-xl flex items-center justify-center text-white font-bold font-emirates">
                    {selectedContact.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 font-montessart">
                      {selectedContact.name}
                    </h3>
                    <p className="text-gray-500 font-montessart text-sm">
                      {selectedContact.position} • {selectedContact.airline}
                    </p>
                  </div>
                </div>
                <div className="text-gray-500 font-montessart text-sm">
                  Last active: {selectedContact.lastActive}
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3/4 rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-[#423772] text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                      }`}
                    >
                      {renderMessageContent(message.text, message.sender === 'user')}

                      <div className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                        {message.sender === 'user' && (
                          <span className="ml-2">
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-xl p-3 font-montessart resize-none focus:ring-2 focus:ring-[#423772] focus:border-[#423772] outline-none transition-all"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-[#423772] text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-[#312456] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <FiSend className="text-lg" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <FiUser className="text-6xl mb-4 text-gray-300" />
              <p className="font-montessart text-lg mb-2">No conversation selected</p>
              <p className="font-montessart text-sm">Choose a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;