import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search, Phone, Video, MoreVertical, Paperclip, Send,
    Image as ImageIcon, Mic, Check, CheckCheck, Circle, MessageSquare, Plus
} from 'lucide-react';
import { Button, Input, Badge } from '../../components/ui';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/store';
import { formatChatTime, getInitials, getAvatarColor, groupMessagesByDate } from '../../utils/chatUtils';

export const DoctorChat: React.FC = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const {
        conversations,
        activeConversationId,
        messages,
        isLoading,
        error,
        setActiveConversation,
        fetchConversations,
        sendMessage,
        subscribeToMessages,
        unsubscribeFromMessages
    } = useChatStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConversations();
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, []);

    useEffect(() => {
        // Handle navigation from other pages (e.g., Patient Profile)
        const state = location.state as any;
        if (state?.selectedPatientId) {
            setActiveConversation(state.selectedPatientId);
        }
    }, [location.state]);

    const activeConv = conversations.find(c => c.user.id === activeConversationId);

    // Fallback for when we navigate to a new patient we haven't chatted with yet
    const locationState = location.state as { selectedPatientId?: string; selectedPatientName?: string } | null;
    const isNewConversation = !activeConv && activeConversationId && locationState?.selectedPatientId === activeConversationId;

    const currentPatient = activeConv?.user || (isNewConversation ? {
        id: locationState!.selectedPatientId!,
        name: locationState!.selectedPatientName || 'Patient',
        role: 'Patient',
        avatar: getInitials(locationState!.selectedPatientName || 'Patient')
    } : null);

    const filteredConversations = conversations.filter(c =>
        c.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!inputMessage.trim() && !fileInputRef.current?.files?.length) || !activeConversationId) return;

        let file = undefined;
        if (fileInputRef.current?.files?.length) {
            file = fileInputRef.current.files[0];
        }

        await sendMessage(activeConversationId, inputMessage, file, currentPatient ? {
            name: currentPatient.name,
            role: currentPatient.role,
            avatar: currentPatient.avatar
        } : undefined);

        setInputMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden animate-fade-in text-neutral-900 font-sans">
            {/* Sidebar - Conversation List */}
            <div className="w-80 md:w-96 border-r border-neutral-100 flex flex-col bg-neutral-50/50">
                <div className="p-6 pb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Messages</h1>
                        <Badge variant="neutral" className="bg-white shadow-sm border-neutral-200">{conversations.filter(c => c.unreadCount > 0).length} New</Badge>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="Search patients..."
                            className="pl-10 bg-white border-transparent shadow-sm focus:border-emerald-500 focus:ring-emerald-100 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                    {isLoading && conversations.length === 0 ? (
                        <div className="p-4 text-center text-neutral-400">Loading...</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">
                            <p>No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.user.id}
                                onClick={() => setActiveConversation(conv.user.id)}
                                className={`
                    p-4 rounded-2xl cursor-pointer transition-all duration-200 group
                    ${activeConversationId === conv.user.id
                                        ? 'bg-white shadow-md border border-emerald-100 scale-[1.02]'
                                        : 'hover:bg-white hover:shadow-sm border border-transparent'}
                  `}
                            >
                                <div className="flex gap-4">
                                    <div className="relative shrink-0">
                                        <div className={`
                        h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors
                        ${activeConversationId === conv.user.id ? 'bg-emerald-600 text-white' : getAvatarColor(conv.user.name)}
                      `}>
                                            {conv.user.avatar || getInitials(conv.user.name)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold text-sm truncate ${activeConversationId === conv.user.id ? 'text-emerald-700' : 'text-neutral-900'}`}>
                                                {conv.user.name}
                                            </h3>
                                            <span className="text-[10px] text-neutral-400">
                                                {conv.lastMessage ? formatChatTime(conv.lastMessage.created_at) : ''}
                                            </span>
                                        </div>

                                        <p className="text-xs text-neutral-500 truncate mb-1">
                                            {conv.user.role}
                                        </p>

                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                                                {conv.lastMessage?.text || 'No messages yet'}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="h-5 w-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0 animate-bounce">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            {currentPatient ? (
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    </div>

                    <div className="px-8 py-5 border-b border-neutral-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${getAvatarColor(currentPatient.name)}`}>
                                {currentPatient.avatar || getInitials(currentPatient.name)}
                            </div>
                            <div>
                                <h2 className="font-bold text-neutral-900 text-lg leading-tight">{currentPatient.name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs text-neutral-500">Online • {currentPatient.role || 'Patient'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-emerald-600 rounded-full">
                                <Phone className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-emerald-600 rounded-full">
                                <Video className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-10 w-10 text-emerald-200" />
                                </div>
                                <p className="font-medium">Start a conversation with {currentPatient.name}</p>
                                <p className="text-sm opacity-60">Messages are secure and private.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.sender_id === user?.id;
                                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);

                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group ${!showAvatar && !isMe ? 'pl-10' : ''}`}>
                                        {!isMe && showAvatar && (
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-auto mb-1 shadow-sm ${getAvatarColor(currentPatient.name)}`}>
                                                {currentPatient.avatar || getInitials(currentPatient.name)}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-1 max-w-[70%]">
                                            <div className={`
                             px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed relative
                             ${isMe
                                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                                    : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none'}
                          `}>
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mb-2 space-y-2">
                                                        {msg.attachments.map((url, i) => (
                                                            <div key={i} className="rounded-lg overflow-hidden border border-white/20">
                                                                {/* Simple check for update */}
                                                                <a href={url} target="_blank" rel="noopener noreferrer" className="block bg-black/5 p-2 hover:bg-black/10 transition-colors flex items-center gap-2">
                                                                    <Paperclip className="h-4 w-4" />
                                                                    <span className="text-xs truncate max-w-[150px]">Attachment {i + 1}</span>
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {msg.text}
                                            </div>

                                            <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'} px-1`}>
                                                <span className="text-[10px] text-neutral-400">
                                                    {formatChatTime(msg.created_at)}
                                                </span>
                                                {isMe && (
                                                    msg.is_read ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Check className="h-3 w-3 text-neutral-300" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-6 bg-white border-t border-neutral-100">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={() => { }}
                            />
                            <div className="flex gap-2 mb-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleFileSelect}
                                    className="text-neutral-400 hover:text-emerald-600 rounded-full transition-colors"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex-1 relative">
                                <Input
                                    value={inputMessage}
                                    onChange={e => setInputMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="pr-10 py-3 rounded-2xl bg-neutral-50 border-neutral-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                className={`
                     rounded-xl aspect-square p-0 w-12 flex items-center justify-center transition-all duration-300 shadow-md mb-0.5
                     ${inputMessage.trim() ? 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}
                  `}
                                disabled={!inputMessage.trim()}
                            >
                                <Send className="h-5 w-5 ml-0.5" />
                            </Button>
                        </form>
                    </div>

                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/30">
                    <div className="h-24 w-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="h-10 w-10 opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-700 mb-2">Select a Patient</h3>
                    <p className="max-w-xs text-center text-sm">Choose a patient from the list to start messaging.</p>
                </div>
            )}
        </div>
    );
};

export default DoctorChat;
