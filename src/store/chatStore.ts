import { create } from 'zustand';
import { supabase } from '../supabaseClient';

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    created_at: string;
    is_read: boolean;
    file_url?: string;
    file_type?: string;
    attachments?: string[];
}

export interface Conversation {
    user: {
        id: string;
        name: string;
        avatar?: string;
        role: string;
        specialty?: string; // For doctors
    };
    lastMessage: Message | null;
    unreadCount: number;
}

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    isLoading: boolean;
    error: string | null;

    // Typing & Online Status (Local state for now)
    typingUsers: Record<string, boolean>;
    onlineUsers: Record<string, boolean>;

    setActiveConversation: (userId: string) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (otherUserId: string) => Promise<void>;
    sendMessage: (receiverId: string, text: string, file?: File, receiverDetails?: { name: string; role?: string; specialty?: string; avatar?: string }) => Promise<void>;
    markAsRead: (senderId: string) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;

    // Helper actions
    setTyping: (userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,
    error: null,
    typingUsers: {},
    onlineUsers: {},

    setActiveConversation: (userId) => {
        set({ activeConversationId: userId });
        // Immediately fetch messages for the selected user
        get().fetchMessages(userId);
        // Mark messages as read
        get().markAsRead(userId);
    },

    setTyping: (userId, isTyping) => {
        set(state => ({
            typingUsers: { ...state.typingUsers, [userId]: isTyping }
        }));
    },

    fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                set({ isLoading: false });
                return;
            }

            // Fetch distinct conversations based on messages
            // We use a query that gets the latest message for each conversation
            // Note: This is an optimized approach but might need adjustment based on exact data volume

            // First get all messages where current user is sender OR receiver
            const { data: allMessages, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, name, role, specialization),
                    receiver:receiver_id(id, name, role, specialization)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const conversationMap = new Map<string, Conversation>();

            if (allMessages) {
                allMessages.forEach((msg: any) => {
                    // Determine who the "other" user is
                    const isMeSender = msg.sender_id === user.id;
                    const otherUser = isMeSender ? msg.receiver : msg.sender;

                    // Skip if user data is missing (deleted users, etc.)
                    if (!otherUser) return;

                    // If we haven't seen this user yet, add them to map
                    if (!conversationMap.has(otherUser.id)) {
                        // Handle Case Sensitivity for Roles
                        let normalizedRole = otherUser.role;
                        if (normalizedRole === 'DOCTOR') normalizedRole = 'Doctor';
                        if (normalizedRole === 'PATIENT') normalizedRole = 'Patient';
                        if (normalizedRole === 'ADMIN') normalizedRole = 'Admin';
                        if (!normalizedRole) normalizedRole = 'User';

                        let displaySpecialty = otherUser.specialization || otherUser.specialty;
                        // If no specialty and is doctor, default
                        if ((normalizedRole === 'Doctor' || otherUser.role === 'DOCTOR') && !displaySpecialty) {
                            displaySpecialty = 'General Practice';
                        }

                        conversationMap.set(otherUser.id, {
                            user: {
                                id: otherUser.id,
                                name: otherUser.name || 'Unknown User',
                                role: normalizedRole,
                                specialty: displaySpecialty,
                                avatar: otherUser.name ? otherUser.name.substring(0, 2).toUpperCase() : '??'
                            },
                            lastMessage: {
                                id: msg.id,
                                sender_id: msg.sender_id,
                                receiver_id: msg.receiver_id,
                                text: msg.text,
                                created_at: msg.created_at,
                                is_read: msg.is_read,
                                file_url: msg.attachments && msg.attachments.length > 0 ? msg.attachments[0] : undefined,
                                attachments: msg.attachments
                            },
                            unreadCount: 0
                        });
                    }
                    // Count unread messages
                    // Only count if THEY sent it and I haven't read it
                    if (msg.sender_id === otherUser.id && !msg.is_read) {
                        const conv = conversationMap.get(otherUser.id)!;
                        conv.unreadCount += 1;
                    }
                });
            }

            set({ conversations: Array.from(conversationMap.values()), isLoading: false });
        } catch (err: any) {
            console.error('Error fetching conversations:', err);
            set({ error: err.message, isLoading: false });
        }
    },

    fetchMessages: async (otherUserId) => {
        if (!otherUserId) return;

        set({ isLoading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;

            set({ messages: data || [], isLoading: false });
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            set({ error: err.message, isLoading: false });
        }
    },

    sendMessage: async (receiverId, text, file, receiverDetails?) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let attachments: string[] = [];
            let fileUrl: string | undefined;

            // Handle File Upload
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `chat/${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage.from('medical-documents').upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('medical-documents').getPublicUrl(filePath);
                fileUrl = urlData.publicUrl;
                attachments.push(fileUrl);
            }

            // Prepare message object
            const newMessage = {
                sender_id: user.id,
                receiver_id: receiverId,
                text,
                attachments: attachments.length > 0 ? attachments : null,
                is_read: false,
                created_at: new Date().toISOString() // for optimistic UI
            };

            // OPTIMISTIC UI UPDATE
            // 1. Update Messages
            const optimisticId = `temp-${Date.now()}`;
            const optimisticMessage: Message = {
                ...newMessage,
                id: optimisticId,
                created_at: newMessage.created_at
            };

            set(state => ({
                messages: [...state.messages, optimisticMessage]
            }));

            // 2. Update Conversations
            const currentConversations = get().conversations;
            let updatedConversations = currentConversations.map(c => {
                if (c.user.id === receiverId) {
                    return {
                        ...c,
                        lastMessage: optimisticMessage
                    };
                }
                return c;
            });

            // If new conversation, add it
            if (!updatedConversations.find(c => c.user.id === receiverId) && receiverDetails) {
                updatedConversations = [{
                    user: {
                        id: receiverId,
                        name: receiverDetails.name,
                        role: receiverDetails.role || 'User',
                        specialty: receiverDetails.specialty,
                        avatar: receiverDetails.avatar
                    },
                    lastMessage: optimisticMessage,
                    unreadCount: 0
                }, ...updatedConversations];
            }

            set({ conversations: updatedConversations });

            // REAL DB INSERT
            const { error: insertError } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    receiver_id: receiverId,
                    text,
                    attachments: attachments.length > 0 ? attachments : null,
                    is_read: false
                });

            if (insertError) {
                // Determine rollback or error state
                console.error('Error sending message:', insertError);
                // Ideally remove optimistic message or show error
                set(state => ({
                    messages: state.messages.filter(m => m.id !== optimisticId),
                    error: "Failed to send message"
                }));
                throw insertError;
            }

            // Message sent successfully, no need to refetch immediately due to optimistic update
            // However, fetching ensures we get the real ID and server timestamp
            // We can do this silently
            // get().fetchMessages(receiverId); 

        } catch (err: any) {
            console.error('Error in sendMessage:', err);
            set({ error: err.message });
        }
    },

    markAsRead: async (senderId) => {
        if (!senderId) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('sender_id', senderId)
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            // Optimistically update conversation unread count
            set(state => ({
                conversations: state.conversations.map(c =>
                    c.user.id === senderId ? { ...c, unreadCount: 0 } : c
                )
            }));

        } catch (err) {
            console.error('Error marking as read:', err);
        }
    },

    subscribeToMessages: () => {
        // Unsubscribe existing first to avoid duplicates
        get().unsubscribeFromMessages();

        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const newMsg = payload.new as Message;

                // Only care if I am the sender or receiver
                if (newMsg.sender_id !== user.id && newMsg.receiver_id !== user.id) return;

                const activeId = get().activeConversationId;

                // If it's a message in the active chat
                if (activeId && (newMsg.sender_id === activeId || newMsg.receiver_id === activeId)) {
                    // Check if we already have this message (from optimistic update)
                    const exists = get().messages.some(m =>
                        (m.id === newMsg.id) ||
                        (m.text === newMsg.text && Math.abs(new Date(m.created_at).getTime() - new Date(newMsg.created_at).getTime()) < 1000)
                    );

                    if (!exists) {
                        set(state => ({
                            messages: [...state.messages, newMsg]
                        }));

                        // If I'm the receiver and I'm looking at it, mark as read
                        if (newMsg.receiver_id === user.id) {
                            get().markAsRead(newMsg.sender_id);
                        }
                    } else {
                        // Replace temp/optimistic message with real one if needed
                        // Implementation detail: usually fine to just refetch or leave as is
                    }
                }

                // Always refresh conversations to update snippets/unread counts/ordering
                // Could be optimized to just update local state, but fetching helps sync
                get().fetchConversations();

                // Play notification sound if incoming message
                if (newMsg.receiver_id === user.id && newMsg.sender_id !== activeId) {
                    // new Audio('/notification.mp3').play().catch(() => {});
                }
            })
            .subscribe();

        // You could adds channels for typing status or online status here
    },

    unsubscribeFromMessages: () => {
        supabase.removeAllChannels();
    }
}));
