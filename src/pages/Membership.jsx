import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import familyTreeService from '../services/familyTreeService';
import memberService from '../services/memberService';
import membershipService from '../services/membershipService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import { formatLunarDate } from '../utils/lunarCalendar';

const emptyReview = { request: null, roleGroupId: '', linkedMemberId: '' };

export default function Membership() {
    const navigate = useNavigate();
    const { hasPermission } = useFamilyTree();
    const canViewCode = hasPermission('membership.code.view');
    const canManage = hasPermission('membership.manage');
    const [tab, setTab] = useState('families');
    const [trees, setTrees] = useState([]);
    const [currentTree, setCurrentTree] = useState(null);
    const [requests, setRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [roleGroups, setRoleGroups] = useState([]);
    const [joinOpen, setJoinOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [review, setReview] = useState(emptyReview);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const load = async () => {
        setLoading(true); setError('');
        try {
            const [treeData, currentData] = await Promise.all([familyTreeService.getMyTrees(), membershipService.getCurrentTree()]);
            setTrees(treeData); setCurrentTree(currentData);
            if (canViewCode || canManage) {
                const memberData = await memberService.getMembers(); setMembers(memberData);
            }
            if (canManage) {
                const [requestData, groupData] = await Promise.all([membershipService.getJoinRequests(), membershipService.getRoleGroups()]);
                setRequests(requestData); setRoleGroups(groupData);
            }
        } catch (exception) { setError(exception.response?.data?.message || 'Không thể tải thông tin tham gia gia tộc.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [canManage, canViewCode]);

    const join = async event => {
        event.preventDefault(); if (!joinCode.trim()) return;
        setSaving(true); setError(''); setMessage('');
        try { const result = await membershipService.join(joinCode.trim().toUpperCase()); setMessage(result.message); setJoinCode(''); setJoinOpen(false); await load(); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể gửi yêu cầu tham gia.'); }
        finally { setSaving(false); }
    };
    const copyCode = async () => { if (!currentTree?.joinCode) return; await navigator.clipboard.writeText(currentTree.joinCode); setMessage('Đã sao chép mã gia tộc.'); };
    const approve = async event => {
        event.preventDefault(); if (!review.request || !review.roleGroupId) return;
        setSaving(true); setError('');
        try { await membershipService.approve(review.request.id, { roleGroupId: review.roleGroupId, linkedMemberId: review.linkedMemberId || null }); setReview(emptyReview); await load(); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể phê duyệt yêu cầu.'); }
        finally { setSaving(false); }
    };
    const reject = async id => { if (!window.confirm('Từ chối yêu cầu tham gia này?')) return; try { await membershipService.reject(id); await load(); } catch (exception) { setError(exception.response?.data?.message || 'Không thể từ chối yêu cầu.'); } };

    return <div className="page"><Navbar /><main className="page-content">
        <div className="content-header-row"><div className="section-header"><h1 className="section-title">Tham gia gia tộc</h1><p className="section-sub">Quản lý các gia tộc bạn tham gia và yêu cầu đang chờ duyệt.</p></div><div className="content-header-actions"><button className="btn btn-primary btn-sm" onClick={() => setJoinOpen(true)}>+ Tham gia một gia tộc</button></div></div>
        {error && <div className="alert alert-error">{error}</div>}{message && <div className="alert alert-success">{message}</div>}
        <div className="tabs" role="tablist"><button className={`tab ${tab === 'families' ? 'tab-active' : ''}`} onClick={() => setTab('families')}>Gia tộc của bạn</button><button className={`tab ${tab === 'requests' ? 'tab-active' : ''}`} onClick={() => setTab('requests')}>Danh sách yêu cầu tham gia {canManage && requests.length > 0 ? `(${requests.length})` : ''}</button></div>
        {loading ? <div className="card" style={{ padding: 44, textAlign: 'center' }}>Đang tải...</div> : tab === 'families' ? <div style={{ display: 'grid', gap: 16 }}>{trees.map(tree => <div className="card" key={tree.familyTreeId} style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}><div><h2 style={{ fontSize: '1.1rem', marginBottom: 5 }}>{tree.name}</h2><div style={{ color: 'var(--color-text-muted)', fontSize: '.88rem' }}>{tree.role} · Tham gia từ {new Date(tree.createdAt).toLocaleDateString('vi-VN')}</div></div><button className="btn btn-secondary btn-sm" onClick={() => navigate('/select-tree')}>Mở gia tộc</button></div>)}{currentTree && canViewCode && <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--color-primary)' }}><div style={{ color: 'var(--color-text-muted)', fontSize: '.76rem', fontWeight: 700, textTransform: 'uppercase' }}>Mã gia tộc hiện tại</div><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}><strong style={{ fontFamily: 'monospace', letterSpacing: '.16em', fontSize: '1.5rem' }}>{currentTree.joinCode}</strong><button className="btn btn-secondary btn-sm" onClick={copyCode}>Sao chép</button></div><div style={{ color: 'var(--color-text-muted)', fontSize: '.82rem', marginTop: 8 }}>Chia sẻ mã này để mời người thân gửi yêu cầu tham gia.</div></div>}</div> : <div className="card" style={{ padding: 16, overflowX: 'auto' }}>{!canManage ? <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Bạn không có quyền xem yêu cầu tham gia.</div> : requests.length === 0 ? <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chưa có yêu cầu đang chờ.</div> : <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}><thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}><th style={{ padding: 12 }}>Người dùng</th><th style={{ padding: 12 }}>Email</th><th style={{ padding: 12 }}>Ngày gửi</th><th style={{ padding: 12 }}>Thao tác</th></tr></thead><tbody>{requests.map(request => <tr key={request.id} style={{ borderBottom: '1px solid var(--color-border)' }}><td style={{ padding: 12, fontWeight: 700 }}>{request.userName || 'Chưa cập nhật'}</td><td style={{ padding: 12 }}>{request.email}</td><td style={{ padding: 12 }}>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</td><td style={{ padding: 12, whiteSpace: 'nowrap' }}><button className="btn btn-primary btn-sm" onClick={() => setReview({ request, roleGroupId: roleGroups[0]?.id || '', linkedMemberId: '' })}>Đồng ý</button>{' '}<button className="btn btn-sm" style={{ color: '#b91c1c' }} onClick={() => reject(request.id)}>Từ chối</button></td></tr>)}</tbody></table>}</div>}
        {joinOpen && <div className="dialog-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && setJoinOpen(false)}><form className="dialog" onSubmit={join}><div className="dialog-header"><h2>Tham gia một gia tộc</h2><button type="button" className="dialog-close" onClick={() => setJoinOpen(false)}>×</button></div><div className="dialog-body"><label className="dialog-field">Mã gia tộc<input className="input" autoFocus required maxLength={6} value={joinCode} onChange={event => setJoinCode(event.target.value.toUpperCase())} placeholder="Ví dụ: A1B2C3" /></label><p style={{ color: 'var(--color-text-muted)', fontSize: '.84rem', marginTop: 10 }}>Sau khi gửi, quản trị viên gia tộc sẽ chọn vai trò và thành viên liên kết cho bạn.</p></div><div className="dialog-footer"><button type="button" className="btn btn-secondary" onClick={() => setJoinOpen(false)}>Hủy</button><button className="btn btn-primary" disabled={saving || !joinCode.trim()}>{saving ? 'Đang gửi...' : 'Tham gia'}</button></div></form></div>}
        {review.request && <div className="dialog-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && setReview(emptyReview)}><form className="dialog" onSubmit={approve}><div className="dialog-header"><h2>Duyệt thành viên</h2><button type="button" className="dialog-close" onClick={() => setReview(emptyReview)}>×</button></div><div className="dialog-body"><p style={{ marginBottom: 16 }}>Đang duyệt <strong>{review.request.userName || review.request.email}</strong></p><div className="dialog-form-grid"><label className="dialog-field">Vai trò trong gia tộc<select className="input" required value={review.roleGroupId} onChange={event => setReview({ ...review, roleGroupId: event.target.value })}><option value="">Chọn role</option>{roleGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label><label className="dialog-field">Liên kết thành viên<select className="input" value={review.linkedMemberId} onChange={event => setReview({ ...review, linkedMemberId: event.target.value })}><option value="">Không liên kết</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label></div></div><div className="dialog-footer"><button type="button" className="btn btn-secondary" onClick={() => setReview(emptyReview)}>Hủy</button><button className="btn btn-primary" disabled={saving || !review.roleGroupId}>{saving ? 'Đang lưu...' : 'Phê duyệt'}</button></div></form></div>}
    </main></div>;
}
