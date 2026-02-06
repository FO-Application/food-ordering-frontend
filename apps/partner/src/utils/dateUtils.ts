export const formatDateTime = (dateStr: string): string => {
    if (!dateStr) return '';

    // If the date string doesn't end with Z and looks like an ISO string, append Z to treat it as UTC
    // This handles the case where backend sends "2024-01-01T12:00:00" implying UTC but missing the timezone indicator
    let normalizedDateStr = dateStr;
    if (dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
        normalizedDateStr += 'Z';
    }

    try {
        const date = new Date(normalizedDateStr);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false
        }).format(date);
    } catch (e) {
        console.error('Error formatting date:', dateStr, e);
        return dateStr;
    }
};
