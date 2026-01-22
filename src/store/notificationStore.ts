import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { Notification } from '../types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    subscribeToNotifications: () => void;
    unsubscribeFromNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select(`
          *,
          from_user:from_user_id(name, avatar_url)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const notifications = data.map((n: any) => ({
                id: n.id,
                userId: n.user_id,
                fromUserId: n.from_user_id,
                type: n.type,
                title: n.title,
                content: n.content,
                link: n.link,
                isRead: n.is_read,
                createdAt: n.created_at,
                fromUser: n.from_user ? {
                    name: n.from_user.name,
                    avatar: n.from_user.avatar_url
                } : undefined
            }));

            set({
                notifications,
                unreadCount: notifications.filter((n: Notification) => !n.isRead).length,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;

            set(state => {
                const updatedNotifications = state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updatedNotifications,
                    unreadCount: updatedNotifications.filter(n => !n.isRead).length
                };
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            set(state => {
                const updatedNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
                return {
                    notifications: updatedNotifications,
                    unreadCount: 0
                };
            });
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    },

    deleteNotification: async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => {
                const updatedNotifications = state.notifications.filter(n => n.id !== id);
                return {
                    notifications: updatedNotifications,
                    unreadCount: updatedNotifications.filter(n => !n.isRead).length
                };
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    },

    subscribeToNotifications: () => {
        const { fetchNotifications } = get();

        // Check if subscription already exists
        let exists = false;
        supabase.getChannels().forEach(channel => {
            if (channel.topic === 'realtime:notifications') {
                exists = true;
            }
        });
        if (exists) return;

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            supabase
                .channel('notifications')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    fetchNotifications();
                })
                .subscribe();
        });
    },

    unsubscribeFromNotifications: () => {
        supabase.getChannels().forEach(channel => {
            if (channel.topic === 'realtime:notifications') {
                supabase.removeChannel(channel);
            }
        });
    }
}));
