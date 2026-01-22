import { format, isToday, isYesterday } from 'date-fns';

export const formatChatTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'h:mm a');
};

export const formatChatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);

    if (isToday(date)) {
        return 'Today';
    } else if (isYesterday(date)) {
        return 'Yesterday';
    } else {
        return format(date, 'MMM d, yyyy');
    }
};

export const getInitials = (name: string): string => {
    if (!name) return '??';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

export const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    messages.forEach(msg => {
        const dateKey = formatChatDate(msg.created_at);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(msg);
    });

    return groups;
};

export const getAvatarColor = (name: string) => {
    const colors = [
        'bg-red-100 text-red-700',
        'bg-orange-100 text-orange-700',
        'bg-amber-100 text-amber-700',
        'bg-yellow-100 text-yellow-700',
        'bg-lime-100 text-lime-700',
        'bg-green-100 text-green-700',
        'bg-emerald-100 text-emerald-700',
        'bg-teal-100 text-teal-700',
        'bg-cyan-100 text-cyan-700',
        'bg-sky-100 text-sky-700',
        'bg-blue-100 text-blue-700',
        'bg-indigo-100 text-indigo-700',
        'bg-violet-100 text-violet-700',
        'bg-purple-100 text-purple-700',
        'bg-fuchsia-100 text-fuchsia-700',
        'bg-pink-100 text-pink-700',
        'bg-rose-100 text-rose-700',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};
