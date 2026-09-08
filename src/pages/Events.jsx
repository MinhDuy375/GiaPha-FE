import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import eventService from '../services/eventService';
import memberService from '../services/memberService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import { formatLunarDate } from '../utils/lunarCalendar';

export default function Events() {
    const navigate = useNavigate();
    const { hasPermission } = useFamilyTree();
    const canManage = hasPermission('event.manage');
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState({ title: '', eventType: 'custom', eventDate: '', memberId: '', description: '', isRecurringYearly: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [searchTitle, setSearchTitle] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterType, setFilterType] = useState('all');

    const load = async () => {
        setLoading(true); setError('');
        try { const [eventData, memberData] = await Promise.all([eventService.getEvents(), memberService.getMembers()]); setEvents(eventData); setMembers(memberData); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể tải sự kiện.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async event => {
        event.preventDefault(); setError('');
        try { await eventService.createEvent({ ...form, memberId: form.memberId || null }); setForm({ title: '', eventType: 'custom', eventDate: '', memberId: '', description: '', isRecurringYearly: false }); await load(); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể thêm sự kiện.'); }
    };
    const remove = async id => { if (!window.confirm('Xóa sự kiện này?')) return; try { await eventService.deleteEvent(id); await load(); } catch (exception) { setError(exception.response?.data?.message || 'Không thể xóa sự kiện.'); } };
    const typeName = { custom: 'Sự kiện', birthday: 'Sinh nhật', death_anniversary: 'Ngày giỗ' };
    const formatEventLunarDate = item => {
        const isDeathAnniversary = item.eventType === 'death_anniversary';
        const date = isDeathAnniversary
            ? [item.memberDeathLunarDay, item.memberDeathLunarMonth, item.memberDeathLunarYear]
            : [item.memberBirthLunarDay, item.memberBirthLunarMonth, item.memberBirthLunarYear];
        const storedDate = isDeathAnniversary ? item.memberDeathDateLunar : item.memberBirthDateLunar;
        if (storedDate) return storedDate;
        if (date[0] && date[1]) return `${date[0]}/${date[1]}${date[2] ? `/${date[2]}` : ''}`;
        return formatLunarDate(item.eventDate);
    };
    const formatSolarDate = value => {
        const date = new Date(value);
        return { day: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), year: date.getFullYear() };
    };

    return <div className="page"><Navbar /><main className="page-content">
        <div className="content-header-row"><div className="section-header"><h1 className="section-title">Sự kiện dòng họ</h1><p className="section-sub">Theo dõi ngày giỗ, sinh nhật và các sự kiện quan trọng.</p></div></div>
        {canManage && <form className="card" style={{ padding: 16, marginBottom: 20 }} onSubmit={save}><div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: 10, alignItems: 'end' }}><label>Tên sự kiện<input className="input" required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>Loại<select className="input" value={form.eventType} onChange={event => setForm({ ...form, eventType: event.target.value })}><option value="custom">Sự kiện</option><option value="birthday">Sinh nhật</option><option value="death_anniversary">Ngày giỗ</option></select></label><label>Ngày<input className="input" type="date" required value={form.eventDate} onChange={event => setForm({ ...form, eventDate: event.target.value })} /></label><label>Thành viên<select className="input" value={form.memberId} onChange={event => setForm({ ...form, memberId: event.target.value })}><option value="">Không gắn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label></div><div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}><input type="checkbox" checked={form.isRecurringYearly} onChange={event => setForm({ ...form, isRecurringYearly: event.target.checked })} /> Lặp lại hàng năm <input className="input" style={{ flex: 1 }} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Mô tả thêm..." /><button className="btn btn-primary">Thêm sự kiện</button></div></form>}
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="card" style={{ padding: 16, overflowX: 'auto' }}>{loading ? <div style={{ padding: 30, textAlign: 'center' }}>Đang tải...</div> : <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}><thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}><th style={{ padding: 12 }}>Ngày dương</th><th style={{ padding: 12 }}>Năm</th><th style={{ padding: 12 }}>Ngày âm lịch</th><th style={{ padding: 12 }}>Sự kiện</th><th style={{ padding: 12 }}>Thành viên</th><th style={{ padding: 12 }}>Thông tin chi tiết</th><th style={{ padding: 12 }}>Thao tác</th></tr></thead><tbody>{events.map(item => { const solarDate = formatSolarDate(item.eventDate); return <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' }}><td style={{ padding: 12, whiteSpace: 'nowrap' }}>{solarDate.day}</td><td style={{ padding: 12 }}>{solarDate.year}</td><td style={{ padding: 12, whiteSpace: 'nowrap' }}>{formatEventLunarDate(item)}</td><td style={{ padding: 12 }}><strong>{item.title}</strong><div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{typeName[item.eventType] || item.eventType}</div>{item.isRecurringYearly && <span className="chip" style={{ marginTop: 6, display: 'inline-block' }}>Hàng năm</span>}</td><td style={{ padding: 12 }}>{item.memberName || 'Toàn dòng họ'}</td><td style={{ padding: 12, minWidth: 220 }}>{item.description || 'Không có mô tả'}{item.images?.length > 0 && <div style={{ color: 'var(--color-text-muted)', fontSize: '.8rem', marginTop: 6 }}>{item.images.length} hình ảnh đính kèm</div>}</td><td style={{ padding: 12 }}>{canManage && <button className="btn btn-sm" style={{ color: '#ef4444' }} onClick={() => remove(item.id)}>Xóa</button>}</td></tr>; })}</tbody></table>}{!loading && events.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có sự kiện.</div>}</div>
    </main></div>;
}

