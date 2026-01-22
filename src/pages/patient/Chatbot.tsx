import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Sparkles, Bot, User, RefreshCw, ThumbsUp,
    ThumbsDown, Copy, Check, MessageSquare, Shield, HelpCircle
} from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { getHealthChatResponse } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const PatientChatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'model',
            text: "Hello! I'm your CarryConnect AI health assistant. I can help answer health questions, explain medical terms, or provide wellness tips. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestedPrompts = [
        "What are symptoms of Vitamin D deficiency?",
        "Healthy breakfast ideas for low cholesterol",
        "How to improve sleep quality?",
        "Explain High Blood Pressure simply"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Get AI response
            const responseText = await getHealthChatResponse(messages, text);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "I apologize, but I'm having trouble connecting to the network right now. Please try again later.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden animate-fade-in relative">

            {/* Header */}
            <div className="p-6 border-b border-neutral-100 bg-white flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Bot className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                            AI Health Assistant
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">Beta</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-xs text-neutral-500">Online & Ready to Help</p>
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex gap-2">
                    <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setMessages([messages[0]])}>Clear Chat</Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50">

                {messages.length === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {suggestedPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                className="p-4 bg-white border border-neutral-200 hover:border-indigo-300 hover:shadow-md rounded-xl text-left transition-all text-sm text-neutral-600 hover:text-indigo-600 group"
                                onClick={() => handleSend(prompt)}
                            >
                                <span className="font-semibold block mb-1 group-hover:text-indigo-700">Suggestion {i + 1}</span>
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                {messages.map((msg, idx) => {
                    // Simple Markdown Parser: Handles **bold** and newlines
                    const formatMessage = (text: string) => {
                        return text.split('\n').map((line, i) => {
                            if (!line.trim()) return <br key={i} />;

                            // Parse bold text
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                                <p key={i} className="mb-2 last:mb-0">
                                    {parts.map((part, j) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={j} className="font-bold text-indigo-700 bg-indigo-50/50 px-1 rounded">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}
                                </p>
                            );
                        });
                    };

                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-in`}
                        >
                            <div className={`
                                h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-sm
                                ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-neutral-200 text-indigo-600'}
                                `}>
                                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
                            </div>

                            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`
                                    p-5 rounded-2xl shadow-sm leading-relaxed text-sm
                                    ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white border border-neutral-100 text-neutral-800 rounded-tl-none'}
                                    `}>
                                    {msg.role === 'model' && (
                                        <p className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wider flex items-center gap-1 border-b border-indigo-100 pb-2">
                                            <Sparkles className="h-3 w-3" /> AI Response
                                        </p>
                                    )}
                                    <div className="whitespace-pre-wrap">
                                        {formatMessage(msg.text)}
                                    </div>
                                </div>
                                <span className="text-[10px] text-neutral-400 mt-2 px-1">
                                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="h-10 w-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-indigo-600">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-neutral-100 flex items-center gap-2">
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-neutral-100">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative flex items-center gap-2 max-w-4xl mx-auto"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about your health..."
                        className="pr-12 py-3 rounded-full border-neutral-200 focus:border-indigo-500 focus:ring-indigo-100 shadow-sm"
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className={`
               absolute right-1 top-1 bottom-1 rounded-full aspect-square p-0 flex items-center justify-center transition-all
               ${!input.trim() ? 'bg-neutral-200 text-neutral-400 hover:bg-neutral-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'}
             `}
                    >
                        <Send className="h-5 w-5 ml-0.5" />
                    </Button>
                </form>
                <p className="text-center text-xs text-neutral-400 mt-3 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    AI responses are for informational purposes only. Consult a doctor for medical advice.
                </p>
            </div>

        </div>
    );
};

export default PatientChatbot;
