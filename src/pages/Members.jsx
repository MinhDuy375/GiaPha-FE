import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import memberService from '../services/memberService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import { MemberFormModal } from './FamilyTree';

const IconSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconRefresh = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);
const IconPlus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export default function Members() {
    const navigate = useNavigate();
    const { hasPermission } = useFamilyTree();
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [gender, setGender] = useState('all');
    const [status, setStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const loadMembers = async () => {
        setLoading(true);
        setError('');
        try {
            setMembers(await memberService.getMembers());
        } catch (exception) {
            setError(exception.response?.data?.message || 'Không thể tải danh sách thành viên.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMembers(); }, []);

    const filteredMembers = useMemo(() => members
        .filter(member => !search || member.fullName?.toLowerCase().includes(search.toLowerCase()))
        .filter(member => gender === 'all' || String(member.gender) === gender)
        .filter(member => status === 'all' || (status === 'alive' ? member.isAlive : !member.isAlive))
        .sort((first, second) => {
            if (sortBy === 'generation') return (first.generationLevel || 0) - (second.generationLevel || 0);
            if (sortBy === 'birth') return (first.birthYear || 9999) - (second.birthYear || 9999);
            return (first.fullName || '').localeCompare(second.fullName || '', 'vi');
        }), [members, search, gender, status, sortBy]);

    const handleDelete = async member => {
        if (!hasPermission('member_list.delete') || !window.confirm(`Xóa thành viên ${member.fullName}?`)) return;
        try {
            await memberService.deleteMember(member.id);
            await loadMembers();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Không thể xóa thành viên.');
        }
    };

    const handleCreate = async data => {
        const { avatarFile, ...memberData } = data;
        const result = await memberService.createMember(memberData);
        if (avatarFile && result.id) await memberService.uploadAvatar(result.id, avatarFile);
        await loadMembers();
    };

    const exportExcel = () => {
        const rows = [['Họ và tên', 'Giới tính', 'Đời', 'Năm sinh', 'Năm mất', 'Nghề nghiệp', 'Nơi ở', 'Trạng thái'], ...filteredMembers.map(member => [member.fullName, member.gender === 0 ? 'Nam' : member.gender === 1 ? 'Nữ' : 'Khác', member.generationLevel || '', member.birthYear || '', member.deathYear || '', member.occupation || '', member.currentResidence || '', member.isAlive ? 'Còn sống' : 'Đã mất'])];
        const csv = '\ufeff' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = 'danh-sach-thanh-vien.xls'; link.click(); URL.revokeObjectURL(link.href);
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-content">
                <div className="content-header-row"><div className="section-header"><h1 className="section-title">Danh sách thành viên</h1><p className="section-sub">Tra cứu và quản lý hồ sơ trong dòng họ hiện tại.</p></div><div className="content-header-actions"><button className="btn btn-secondary btn-sm" onClick={loadMembers}><IconRefresh /> Làm mới</button><button className="btn btn-primary btn-sm" disabled={!hasPermission('member_list.create')} onClick={() => setModalOpen(true)}><IconPlus /> Thêm thành viên</button><button className="btn btn-secondary btn-sm" disabled={!hasPermission('tree_view.export')} onClick={exportExcel}>Xuất Excel</button></div></div>

                <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) repeat(3, minmax(130px, 180px))', gap: 10 }}>
                        <label style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 10, top: 10, color: 'var(--color-text-muted)' }}><IconSearch /></span>
                            <input className="input" style={{ paddingLeft: 34 }} value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo họ tên..." />
                        </label>
                        <select className="input" value={gender} onChange={event => setGender(event.target.value)}>
                            <option value="all">Tất cả giới tính</option><option value="0">Nam</option><option value="1">Nữ</option><option value="2">Khác</option>
                        </select>
                        <select className="input" value={status} onChange={event => setStatus(event.target.value)}>
                            <option value="all">Tất cả trạng thái</option><option value="alive">Còn sống</option><option value="dead">Đã mất</option>
                        </select>
                        <select className="input" value={sortBy} onChange={event => setSortBy(event.target.value)}>
                            <option value="name">Sắp xếp theo tên</option><option value="generation">Theo đời</option><option value="birth">Theo năm sinh</option>
                        </select>
                    </div>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
                <div className="card" style={{ overflowX: 'auto' }}>
                    {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải danh sách...</div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                            <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ padding: '14px 16px' }}>Họ và tên</th><th style={{ padding: '14px 16px' }}>Giới tính</th><th style={{ padding: '14px 16px' }}>Đời</th><th style={{ padding: '14px 16px' }}>Sinh - mất</th><th style={{ padding: '14px 16px' }}>Nghề nghiệp</th><th style={{ padding: '14px 16px' }}>Trạng thái</th><th style={{ padding: '14px 16px' }}>Thao tác</th>
                            </tr></thead>
                            <tbody>{filteredMembers.map(member => <tr key={member.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '13px 16px', fontWeight: 700 }}>{member.fullName}</td>
                                <td style={{ padding: '13px 16px' }}>{member.gender === 0 ? 'Nam' : member.gender === 1 ? 'Nữ' : 'Khác'}</td>
                                <td style={{ padding: '13px 16px' }}>{member.generationLevel || 'Không rõ'}</td>
                                <td style={{ padding: '13px 16px' }}>{member.birthYear || '?'} - {member.deathYear || (member.isAlive ? 'nay' : '?')}</td>
                                <td style={{ padding: '13px 16px' }}>{member.occupation || 'Chưa cập nhật'}</td>
                                <td style={{ padding: '13px 16px' }}><span className="chip">{member.isAlive ? 'Còn sống' : 'Đã mất'}</span></td>
                                <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/family-tree')}>Xem cây</button>{' '}
                                    <button className="btn btn-sm" disabled={!hasPermission('member_list.delete')} onClick={() => handleDelete(member)} style={{ color: '#ef4444' }}>Xóa</button>
                                </td>
                            </tr>)}</tbody>
                        </table>
                    )}
                    {!loading && filteredMembers.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Không tìm thấy thành viên phù hợp.</div>}
                </div>
            </main>
            <MemberFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} members={members} editingMember={null} />
        </div>
    );
}
