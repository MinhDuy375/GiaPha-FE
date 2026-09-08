import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import eventService from '../services/eventService';
import galleryService from '../services/galleryService';
import memberService from '../services/memberService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
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

    const filteredEvents = useMemo(() => {
        let result = [...events];
        if (searchTitle.trim()) {
            const query = searchTitle.trim().toLowerCase();
            result = result.filter(item => item.title?.toLowerCase().includes(query));
        }
        if (filterType !== 'all') {
            result = result.filter(item => item.eventType === filterType);
        }
        result.sort((a, b) => {
            const dateA = new Date(a.eventDate).getTime();
            const dateB = new Date(b.eventDate).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        return result;
    }, [events, searchTitle, filterType, sortOrder]);

    return (
        <div className="page">
            <Navbar />
            <main className="page-content">
                <div className="content-header-row">
                    <div className="section-header">
                        <h1 className="section-title">Sự kiện dòng họ</h1>
                        <p className="section-sub">Theo dõi ngày giỗ, sinh nhật và các sự kiện quan trọng.</p>
                    </div>
                </div>

                {canManage && (
                    <form className="card" style={{ padding: 16, marginBottom: 20 }} onSubmit={save}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: 10, alignItems: 'end' }}>
                            <label>Tên sự kiện<input className="input" required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
                            <label>Loại<select className="input" value={form.eventType} onChange={event => setForm({ ...form, eventType: event.target.value })}><option value="custom">Sự kiện</option><option value="birthday">Sinh nhật</option><option value="death_anniversary">Ngày giỗ</option></select></label>
                            <label>Ngày<input className="input" type="date" required value={form.eventDate} onChange={event => setForm({ ...form, eventDate: event.target.value })} /></label>
                            <label>Thành viên<select className="input" value={form.memberId} onChange={event => setForm({ ...form, memberId: event.target.value })}><option value="">Không gắn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
                            <input type="checkbox" checked={form.isRecurringYearly} onChange={event => setForm({ ...form, isRecurringYearly: event.target.checked })} /> Lặp lại hàng năm
                            <input className="input" style={{ flex: 1 }} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Mô tả thêm..." />
                            <button className="btn btn-primary">Thêm sự kiện</button>
                        </div>
                    </form>
                )}

                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 240px', minWidth: 200 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm sự kiện</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Nhập tên sự kiện cần tìm..."
                                value={searchTitle}
                                onChange={e => setSearchTitle(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: '0 0 auto' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, fontWeight: 500 }}>Sắp xếp theo thời gian</label>
                            <select
                                className="input"
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                            >
                                <option value="asc">Thời gian: Tăng dần (Cũ ➔ Mới)</option>
                                <option value="desc">Thời gian: Giảm dần (Mới ➔ Cũ)</option>
                            </select>
                        </div>
                        <div style={{ flex: '0 0 auto' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, fontWeight: 500 }}>Lọc loại sự kiện</label>
                            <select
                                className="input"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="custom">Sự kiện</option>
                                <option value="birthday">Sinh nhật</option>
                                <option value="death_anniversary">Ngày giỗ</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: 30, textAlign: 'center' }}>Đang tải...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: 12 }}>Ngày</th>
                                    <th style={{ padding: 12 }}>Sự kiện</th>
                                    <th style={{ padding: 12 }}>Thành viên</th>
                                    <th style={{ padding: 12 }}>Mô tả</th>
                                    <th style={{ padding: 12 }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: 12 }}>{new Date(item.eventDate).toLocaleDateString('vi-VN')}</td>
                                        <td style={{ padding: 12 }}>
                                            <strong>{item.title}</strong>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                                {typeName[item.eventType] || item.eventType}{item.isRecurringYearly ? ' · Hàng năm' : ''}
                                            </div>
                                        </td>
                                        <td style={{ padding: 12 }}>{item.memberName || 'Toàn dòng họ'}</td>
                                        <td style={{ padding: 12 }}>{item.description || 'Không có'}</td>
                                        <td style={{ padding: 12 }}>
                                            {canManage && (
                                                <button className="btn btn-sm" style={{ color: '#ef4444' }} onClick={() => remove(item.id)}>Xóa</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!loading && events.length === 0 && (
                        <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có sự kiện.</div>
                    )}
                    {!loading && events.length > 0 && filteredEvents.length === 0 && (
                        <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Không tìm thấy sự kiện phù hợp.</div>
                    )}
                </div>
            </main>
        </div>
    );
}

