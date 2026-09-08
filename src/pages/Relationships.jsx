import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import memberService from '../services/memberService';
import relationshipService from '../services/relationshipService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';

export default function Relationships() {
    const navigate = useNavigate();
    const { hasPermission } = useFamilyTree();
    const canEdit = hasPermission('relationship.manage');
    const [members, setMembers] = useState([]);
    const [relations, setRelations] = useState({ parents: [], spouses: [] });
    const [type, setType] = useState('parent_child');
    const [personAId, setPersonAId] = useState('');
    const [personBId, setPersonBId] = useState('');
    const [order, setOrder] = useState(1);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [memberData, relationshipData] = await Promise.all([memberService.getMembers(), relationshipService.getRelationships()]);
            setMembers(memberData);
            setRelations(relationshipData);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Không thể tải dữ liệu quan hệ.');
        } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const save = async event => {
        event.preventDefault();
        if (!canEdit || !personAId || !personBId) return;
        setSaving(true); setError('');
        try {
            await relationshipService.createRelationship({ type, personAId, personBId, order: Number(order) });
            setPersonAId(''); setPersonBId(''); setOrder(1); setFormOpen(false); await load();
        } catch (exception) { setError(exception.response?.data?.message || 'Không thể thêm quan hệ.'); }
        finally { setSaving(false); }
    };
    const remove = async (relationType, id) => {
        if (!canEdit || !window.confirm('Xóa quan hệ này?')) return;
        try { await relationshipService.deleteRelationship(relationType, id); await load(); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể xóa quan hệ.'); }
    };

    const parentRows = relations.parents.map(item => ({ ...item, label: item.type === 'adopted_child' ? 'Con nuôi' : 'Cha/mẹ - con' }));
    const spouseRows = relations.spouses.map(item => ({ ...item, label: 'Vợ/chồng' }));
    const rows = [...parentRows, ...spouseRows].filter(item => filter === 'all' || (filter === 'spouse' ? item.type === 'spouse' : item.type !== 'spouse'));

    return <div className="page"><Navbar /><main className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}><div className="section-header" style={{ marginBottom: 0 }}><h1 className="section-title">Quản lý quan hệ</h1><p className="section-sub">Thêm, xem và xóa các quan hệ trong cây gia phả.</p></div>{canEdit && <button className="btn btn-primary" onClick={() => setFormOpen(true)}>+ Thêm quan hệ</button>}</div>
        {canEdit && formOpen && <div className="dialog-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && setFormOpen(false)}><form className="dialog" onSubmit={save}><div className="dialog-header"><h2>Thêm quan hệ mới</h2><button type="button" className="dialog-close" onClick={() => setFormOpen(false)} aria-label="Đóng">×</button></div><div className="dialog-body"><div className="dialog-form-grid"><label className="dialog-field">Loại quan hệ<select className="input" value={type} onChange={event => setType(event.target.value)}><option value="parent_child">Cha/mẹ - con</option><option value="adopted_child">Con nuôi</option><option value="spouse">Vợ/chồng</option></select></label><label className="dialog-field">Người A<select className="input" value={personAId} onChange={event => setPersonAId(event.target.value)}><option value="">Chọn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label><label className="dialog-field">Người B<select className="input" value={personBId} onChange={event => setPersonBId(event.target.value)}><option value="">Chọn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label><label className="dialog-field">Thứ tự<input className="input" type="number" min="1" value={order} onChange={event => setOrder(event.target.value)} /></label></div></div><div className="dialog-footer"><button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Hủy</button><button type="submit" className="btn btn-primary" disabled={saving || !personAId || !personBId}>{saving ? 'Đang lưu...' : 'Lưu quan hệ'}</button></div></form></div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="card" style={{ padding: 16, overflowX: 'auto' }}><div style={{ display: 'flex', gap: 8, marginBottom: 14 }}><button className="btn btn-secondary btn-sm" onClick={() => setFilter('all')}>Tất cả ({parentRows.length + spouseRows.length})</button><button className="btn btn-secondary btn-sm" onClick={() => setFilter('parent')}>Cha mẹ ({parentRows.length})</button><button className="btn btn-secondary btn-sm" onClick={() => setFilter('spouse')}>Vợ chồng ({spouseRows.length})</button></div>
            {loading ? <div style={{ padding: 30, textAlign: 'center' }}>Đang tải...</div> : <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}><thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}><th style={{ padding: 12 }}>Loại</th><th style={{ padding: 12 }}>Người A</th><th style={{ padding: 12 }}>Người B</th><th style={{ padding: 12 }}>Thứ tự</th><th style={{ padding: 12 }}>Thao tác</th></tr></thead><tbody>{rows.map(item => <tr key={`${item.type}-${item.id}`} style={{ borderBottom: '1px solid var(--color-border)' }}><td style={{ padding: 12 }}>{item.label}</td><td style={{ padding: 12 }}>{item.personA?.fullName || 'Không rõ'}</td><td style={{ padding: 12 }}>{item.personB?.fullName || 'Không rõ'}</td><td style={{ padding: 12 }}>{item.order}</td><td style={{ padding: 12 }}><button className="btn btn-sm" style={{ color: '#ef4444' }} onClick={() => remove(item.type === 'spouse' ? 'spouse' : 'parent', item.id)}>Xóa</button></td></tr>)}</tbody></table>}
            {!loading && rows.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có quan hệ phù hợp.</div>}
        </div>
    </main></div>;
}
