const lunarFormatter = new Intl.DateTimeFormat('en-u-ca-chinese', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
});

export function solarToLunar(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = lunarFormatter.formatToParts(date);
    const day = Number(parts.find(part => part.type === 'day')?.value);
    const monthPart = parts.find(part => part.type === 'month')?.value || '';
    const month = Number.parseInt(monthPart, 10);
    const year = Number(parts.find(part => part.type === 'relatedYear')?.value);
    return { day, month, year, leap: monthPart.includes('bis') };
}

export function formatLunarDate(value, includeYear = true) {
    const lunar = solarToLunar(value);
    if (!lunar) return 'Chưa xác định';
    return `${lunar.day}/${lunar.month}${includeYear ? `/${lunar.year}` : ''}${lunar.leap ? ' (nhuận)' : ''}`;
}

export function formatMemberLunarDate(dateText, day, month, year) {
    if (dateText) return dateText;
    if (!day || !month) return 'Chưa cập nhật';
    return `${day}/${month}${year ? `/${year}` : ''}`;
}
