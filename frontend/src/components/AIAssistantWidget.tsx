'use client';

import api from '@/lib/api';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'assistant',
                    content: 'Bonjour ! Je suis votre assistant IA ReclamTrack. Comment puis-je vous aider aujourd\'hui avec vos réclamations ou vos interventions ?'
                }
            ]);
        }
    }, [isOpen, messages.length]);

    // Auto-scroll to bottom limit
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/api/ai/chat', { message: userMsg.content });
            
            const assistMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: response.data?.reply || response.data?.response || 'Désolé, je n\'ai pas pu comprendre votre demande.' 
            };
            setMessages((prev) => [...prev, assistMsg]);
        } catch (error) {
            console.error('AI chat error:', error);
            const errAssistMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                role: 'assistant', 
                content: '❌ L\'agent IA est temporairement indisponible. Vérifiez que le backend est en cours d\'exécution.' 
            };
            setMessages((prev) => [...prev, errAssistMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {/* The Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[380px] h-[500px] bg-white dark:bg-background border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Assistant IA</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[10px] text-white/80 uppercase tracking-widest font-bold">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-background/50 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex gap-3
                                    ${msg.role === 'user' 
                                        ? 'bg-primary text-white rounded-br-sm' 
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-sm'
                                    }`}
                                >
                                    {msg.role === 'assistant' && (
                                        <Bot className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                                    )}
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-3">
                                    <Bot className="w-4 h-4 text-primary animate-bounce" />
                                    <div className="flex gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white dark:bg-background border-t border-slate-100 dark:border-border-dark shrink-0">
                        <div className="relative flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Posez une question..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-32"
                                rows={1}
                            />
                            <button type="button"
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                Alimenté par ReclamTrack AI
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* The Floating Toggle Button */}
            {!isOpen && (
                <button type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white relative group"
                >
                    <Bot className="w-7 h-7" />
                    {/* Ripple notification effect */}
                    <span className="absolute w-full h-full rounded-full bg-cyan-500 opacity-50 animate-ping"></span>
                    
                    {/* Tooltip */}
                    <span className="absolute right-full mr-4 bg-surface-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Ouvrir l'Assistant IA
                    </span>
                </button>
            )}
        </div>
    );
}
