import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import memberService from '../services/memberService';
import { useFamilyTree } from '../contexts/FamilyTreeContext';
import { MemberFormModal } from './FamilyTree';
import { formatMemberLunarDate } from '../utils/lunarCalendar';
import { exportMembersToExcel } from '../utils/excelUtils';
import { API_ORIGIN } from '../services/api';
import FilterPanel from '../components/FilterPanel';

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
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftSearch, setDraftSearch] = useState(search);
    const [draftGender, setDraftGender] = useState(gender);
    const [draftStatus, setDraftStatus] = useState(status);
    const [draftSortBy, setDraftSortBy] = useState(sortBy);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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

    const pageCount = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
    const safePage = Math.min(currentPage, pageCount);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, gender, status, sortBy]);

    const resetFilter = () => {
        setDraftSearch('');
        setDraftGender('all');
        setDraftStatus('all');
        setDraftSortBy('name');
        setSearch('');
        setGender('all');
        setStatus('all');
        setSortBy('name');
        setFilterOpen(false);
    };

    const applyFilter = () => {
        setSearch(draftSearch);
        setGender(draftGender);
        setStatus(draftStatus);
        setSortBy(draftSortBy);
        setFilterOpen(false);
    };

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

    const handleSave = async data => {
        const { avatarFile, ...memberData } = data;
        await memberService.updateMember(editingMember.id, memberData);
        if (avatarFile) await memberService.uploadAvatar(editingMember.id, avatarFile);
        setEditingMember(null);
        await loadMembers();
    };

    const openEdit = member => setEditingMember({
        ...member,
        full_name: member.fullName,
        birth_year: member.birthYear,
        death_year: member.deathYear,
        birth_month: member.birthMonth,
        birth_day: member.birthDay,
        death_month: member.deathMonth,
        death_day: member.deathDay,
        avatar_url: member.avatarUrl,
        generation: member.generationLevel,
        occupation: member.occupation,
        current_residence: member.currentResidence,
        is_in_law: member.isInLaw,
        birth_order: member.birthOrder,
        taboo_name: member.tabooName,
        courtesy_name: member.courtesyName,
        other_names: member.otherNames,
        birth_date_lunar: member.birthDateLunar,
        birth_lunar_year: member.birthLunarYear,
        birth_lunar_month: member.birthLunarMonth,
        birth_lunar_day: member.birthLunarDay,
        death_date_lunar: member.deathDateLunar,
        death_lunar_year: member.deathLunarYear,
        death_lunar_month: member.deathLunarMonth,
        death_lunar_day: member.deathLunarDay,
        phone_number: member.phoneNumber,
    });

    const exportExcel = () => {
        const rows = [['Họ và tên', 'Giới tính', 'Đời', 'Năm sinh', 'Năm mất', 'Nghề nghiệp', 'Nơi ở', 'Trạng thái'], ...filteredMembers.map(member => [member.fullName, member.gender === 0 ? 'Nam' : member.gender === 1 ? 'Nữ' : 'Khác', member.generationLevel || '', member.birthYear || '', member.deathYear || '', member.occupation || '', member.currentResidence || '', member.isAlive ? 'Còn sống' : 'Đã mất'])];
        const csv = '\ufeff' + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = 'danh-sach-thanh-vien.xls'; link.click(); URL.revokeObjectURL(link.href);
    };

    return (
        <div className="page">
            <Navbar />

            <main className="page-content">
                <div className="content-header-row"><div className="section-header"><h1 className="section-title">Danh sách thành viên</h1><p className="section-sub">Tra cứu và quản lý hồ sơ trong dòng họ hiện tại.</p></div><div className="content-header-actions"><div style={{ display: 'inline-flex', padding: 3, gap: 2, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }} role="tablist" aria-label="Chuyển chế độ xem"><button className="btn btn-ghost btn-sm" onClick={() => navigate('/family-tree')}>Cây</button><button className="btn btn-sm" style={{ background: 'var(--color-primary)', color: '#fff', border: 0 }} aria-selected="true">Danh sách</button></div><button className="btn btn-secondary btn-sm" onClick={loadMembers}><IconRefresh /> Làm mới</button><button className="btn btn-primary btn-sm" disabled={!hasPermission('member_list.create')} onClick={() => setModalOpen(true)}><IconPlus /> Thêm thành viên</button><button className="btn btn-secondary btn-sm" disabled={!hasPermission('tree_view.export')} onClick={exportExcel}>Xuất Excel</button></div></div>

                <div className="card members-filter-card" style={{ padding: 16, marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setFilterOpen(!filterOpen)}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconSearch />Lọc</span>
                        </button>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '.84rem' }}>
                            {search ? `Từ khóa: ${search}` : 'Tất cả'}
                            {gender !== 'all' ? ` · ${gender === '0' ? 'Nam' : gender === '1' ? 'Nữ' : 'Khác'}` : ''}
                            {status !== 'all' ? ` · ${status === 'alive' ? 'Còn sống' : 'Đã mất'}` : ''}
                        </span>
                    </div>
                </div>

                <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} onReset={resetFilter} onApply={applyFilter}>
                    <div className="filter-grid">
                        <label className="filter-field full">
                            <span>Từ khóa</span>
                            <input className="input" value={draftSearch} onChange={event => setDraftSearch(event.target.value)} placeholder="Tìm theo họ tên..." />
                        </label>
                        <label className="filter-field">
                            <span>Giới tính</span>
                            <select className="input" value={draftGender} onChange={event => setDraftGender(event.target.value)}>
                                <option value="all">Tất cả giới tính</option><option value="0">Nam</option><option value="1">Nữ</option><option value="2">Khác</option>
                            </select>
                        </label>
                        <label className="filter-field">
                            <span>Trạng thái</span>
                            <select className="input" value={draftStatus} onChange={event => setDraftStatus(event.target.value)}>
                                <option value="all">Tất cả trạng thái</option><option value="alive">Còn sống</option><option value="dead">Đã mất</option>
                            </select>
                        </label>
                        <label className="filter-field">
                            <span>Sắp xếp</span>
                            <select className="input" value={draftSortBy} onChange={event => setDraftSortBy(event.target.value)}>
                                <option value="name">Sắp xếp theo tên</option><option value="generation">Theo đời</option><option value="birth">Theo năm sinh</option>
                            </select>
                        </label>
                    </div>
                </FilterPanel>

                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
                <div className="card members-table-card" style={{ overflowX: 'auto' }}>
                    {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải danh sách...</div> : (
                        <>
                            <table className="members-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                                <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '14px 16px' }}>Thành viên</th><th style={{ padding: '14px 16px' }}>Giới tính</th><th style={{ padding: '14px 16px' }}>Đời</th><th style={{ padding: '14px 16px' }}>Sinh - mất</th><th style={{ padding: '14px 16px' }}>Nghề nghiệp</th><th style={{ padding: '14px 16px' }}>Ghi chú</th><th style={{ padding: '14px 16px' }}>Thao tác</th>
                                </tr></thead>
                                <tbody>{paginatedMembers.map(member => <tr key={member.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '13px 16px', fontWeight: 700 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{member.avatarUrl ? <img src={member.avatarUrl.startsWith('http') ? member.avatarUrl : `${API_ORIGIN}${member.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.fullName?.slice(0, 1)}</div><span>{member.fullName}</span></div></td>
                                    <td style={{ padding: '13px 16px' }}>{member.gender === 0 ? 'Nam' : member.gender === 1 ? 'Nữ' : 'Khác'}</td>
                                    <td style={{ padding: '13px 16px' }}>{member.generationLevel || 'Không rõ'}</td>
                                    <td style={{ padding: '13px 16px' }}>{member.birthYear || '?'} - {member.deathYear || (member.isAlive ? 'nay' : '?')}</td>
                                    <td style={{ padding: '13px 16px' }}>{member.occupation || 'Chưa cập nhật'}</td>
                                    <td style={{ padding: '13px 16px', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-secondary)' }} title={member.note || ''}>{member.note || 'Không có ghi chú'}</td>
                                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMember(member)}>Xem</button>{' '}
                                        <button className="btn btn-secondary btn-sm" disabled={!hasPermission('member_list.edit')} onClick={() => openEdit(member)}>Sửa</button>{' '}
                                        <button className="btn btn-sm" disabled={!hasPermission('member_list.delete')} onClick={() => handleDelete(member)} style={{ color: '#ef4444' }}>Xóa</button>
                                    </td>
                                </tr>)}</tbody>
                            </table>

                            <div className="members-pagination">
                                <button className="btn btn-secondary btn-sm" disabled={safePage <= 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))}>Trước</button>
                                <span className="members-page-status">Trang {safePage}/{pageCount}</span>
                                <button className="btn btn-secondary btn-sm" disabled={safePage >= pageCount} onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))}>Sau</button>
                            </div>
                        </>
                    )}
                    {!loading && filteredMembers.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Không tìm thấy thành viên phù hợp.</div>}
                </div>
            </main>
            <MemberFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} members={members} editingMember={null} />
            <MemberFormModal open={Boolean(editingMember)} onClose={() => setEditingMember(null)} onSave={handleSave} members={members} editingMember={editingMember} />
            {selectedMember && <div className="modal-overlay" role="dialog" aria-modal="true" onClick={event => event.target === event.currentTarget && setSelectedMember(null)}><div className="modal"><div className="modal-header"><h2 className="modal-title">Thông tin thành viên</h2><button className="btn btn-ghost btn-sm" onClick={() => setSelectedMember(null)}>✕</button></div><div className="modal-body"><h3>{selectedMember.fullName}</h3><p>Đời {selectedMember.generationLevel || 'không rõ'} · {selectedMember.gender === 0 ? 'Nam' : selectedMember.gender === 1 ? 'Nữ' : 'Khác'}</p><p>Sinh: {selectedMember.birthYear || 'không rõ'} · {selectedMember.isAlive ? 'Còn sống' : `Mất: ${selectedMember.deathYear || 'không rõ'}`}</p><p>{selectedMember.biography || 'Chưa có tiểu sử.'}</p><button className="btn btn-primary" onClick={() => { setEditingMember(selectedMember); setSelectedMember(null); }}>Sửa thông tin</button></div></div></div>}
        </div>
    );
}
