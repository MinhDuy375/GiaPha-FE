import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import eventService from '../services/eventService';
import galleryService from '../services/galleryService';
import memberService from '../services/memberService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import { formatLunarDate } from '../utils/lunarCalendar';
import EventAlbumModal from '../components/EventAlbumModal';

const emptyForm = { title: '', eventType: 'custom', eventDate: '', memberId: '', description: '', isRecurringYearly: false };
const typeName = { custom: 'Sự kiện', birthday: 'Sinh nhật', death_anniversary: 'Ngày giỗ' };

function EventModal({ open, event, members, saving, onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const [files, setFiles] = useState([]);
    useEffect(() => {
        if (!open) return;
        setForm(event ? { title: event.title, eventType: event.eventType, eventDate: event.eventDate?.slice(0, 10), memberId: event.memberId || '', description: event.description || '', isRecurringYearly: event.isRecurringYearly } : emptyForm);
        setFiles([]);
    }, [open, event]);
    if (!open) return null;
    return <div className="dialog-overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><form className="dialog" onSubmit={e => { e.preventDefault(); onSave(form, files); }}>
        <div className="dialog-header"><h2>{event ? 'Sửa sự kiện' : 'Thêm sự kiện'}</h2><button type="button" className="dialog-close" onClick={onClose}>×</button></div>
        <div className="dialog-body"><div className="dialog-form-grid">
            <label className="dialog-field dialog-field--wide">Tên sự kiện<input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label className="dialog-field">Loại<select className="input" value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}><option value="custom">Sự kiện</option><option value="birthday">Sinh nhật</option><option value="death_anniversary">Ngày giỗ</option></select></label>
            <label className="dialog-field">Ngày<input className="input" type="date" required value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} /></label>
            <label className="dialog-field">Thành viên<select className="input" value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })}><option value="">Không gắn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label>
            <label className="dialog-field dialog-field--wide">Mô tả<textarea className="input" style={{ minHeight: 90, paddingTop: 10, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label className="dialog-field dialog-field--wide">Ảnh sự kiện<input className="input" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => setFiles([...e.target.files])} /><small style={{ color: 'var(--color-text-muted)' }}>Có thể chọn nhiều ảnh</small></label>
        </div><label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}><input type="checkbox" checked={form.isRecurringYearly} onChange={e => setForm({ ...form, isRecurringYearly: e.target.checked })} /> Lặp lại hàng năm</label></div>
        <div className="dialog-footer"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Hủy</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : event ? 'Cập nhật' : 'Thêm sự kiện'}</button></div>
    </form></div>;
}

export default function Events() {
    const { hasPermission } = useFamilyTree();
    const canManage = hasPermission('event.manage');
    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true); setError('');
        try { const [eventData, memberData] = await Promise.all([eventService.getEvents(), memberService.getMembers()]); setEvents(eventData); setMembers(memberData); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể tải sự kiện.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async (form, files) => {
        setSaving(true); setError('');
        try {
            const result = editing
                ? await eventService.updateEvent(editing.id, { ...form, memberId: form.memberId || null })
                : await eventService.createEvent({ ...form, memberId: form.memberId || null });
            const id = editing?.id || result.id;
            for (const file of files) {
                const data = new FormData();
                data.append('file', file);
                data.append('eventId', id);
                await galleryService.upload(data);
            }
            setOpen(false);
            setEditing(null);
            await load();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Không thể lưu sự kiện.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async id => {
        if (!window.confirm('Xóa sự kiện này?')) return;
        try { await eventService.deleteEvent(id); await load(); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể xóa sự kiện.'); }
    };

    const refreshAlbum = async () => {
        const data = await eventService.getEvents();
        setEvents(data);
        if (selected) setSelected(data.find(item => item.id === selected.id) || null);
    };

    return <div className="page"><Navbar /><main className="page-content">
        <div className="content-header-row">
            <div className="section-header"><h1 className="section-title">Sự kiện dòng họ</h1><p className="section-sub">Theo dõi ngày giỗ, sinh nhật và các sự kiện quan trọng.</p></div>
            {canManage && <button className="btn btn-primary" onClick={() => { setEditing(null); setOpen(true); }}>+ Thêm sự kiện</button>}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
            {loading ? <div style={{ padding: 30, textAlign: 'center' }}>Đang tải...</div> : <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: 12 }}>Ngày</th>
                    <th style={{ padding: 12 }}>Sự kiện</th>
                    <th style={{ padding: 12 }}>Thành viên</th>
                    <th style={{ padding: 12 }}>Mô tả</th>
                    <th style={{ padding: 12 }}>Thao tác</th>
                </tr></thead>
                <tbody>{events.map(item => <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 12 }}>{new Date(item.eventDate).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: 12 }}><strong>{item.title}</strong><div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>{typeName[item.eventType] || item.eventType}{item.isRecurringYearly ? ' · Hàng năm' : ''}</div></td>
                    <td style={{ padding: 12 }}>{item.memberName || 'Toàn dòng họ'}</td>
                    <td style={{ padding: 12 }}>{item.description || 'Không có'}</td>
                    <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                        {item.images?.length > 0 && <button className="btn btn-secondary btn-sm" onClick={() => setSelected(item)}>Ảnh ({item.images.length})</button>}
                        {canManage && <>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(item); setOpen(true); }}>Sửa</button>{' '}
                            <button className="btn btn-sm" style={{ color: '#ef4444' }} onClick={() => remove(item.id)}>Xóa</button>
                        </>}
                    </td>
                </tr>)}</tbody>
            </table>}
            {!loading && events.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có sự kiện.</div>}
        </div>
    </main>
        <EventModal open={open} event={editing} members={members} saving={saving} onClose={() => setOpen(false)} onSave={save} />
        <EventAlbumModal album={selected && { id: selected.id, title: selected.title, images: selected.images || [] }} canManage={hasPermission('gallery.manage')} onClose={() => setSelected(null)} onChanged={refreshAlbum} />
    </div>;
}