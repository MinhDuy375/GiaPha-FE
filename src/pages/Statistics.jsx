import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import memberService from '../services/memberService';
import { formatLunarDate } from '../utils/lunarCalendar';

const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><polyline points="7 10 12 15 17 10" /><path d="M5 21h14" /></svg>;

function StatCard({ label, value, detail, color }) {
    return <div className="card" style={{ padding: 20, borderTop: `3px solid ${color}` }}><div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div><div style={{ color: 'var(--color-text-primary)', fontSize: '2rem', fontWeight: 800, margin: '8px 0 2px' }}>{value}</div><div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{detail}</div></div>;
}

export default function Statistics() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true); setError('');
        try { setMembers(await memberService.getMembers()); }
        catch (exception) { setError(exception.response?.data?.message || 'Không thể tải dữ liệu thống kê.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const summary = useMemo(() => {
        const generations = members.reduce((result, member) => { const key = member.generationLevel || 0; result[key] = (result[key] || 0) + 1; return result; }, {});
        const years = members.reduce((result, member) => { if (member.birthYear) result[member.birthYear] = (result[member.birthYear] || 0) + 1; return result; }, {});
        const currentYear = new Date().getFullYear();
        const ageGroups = { '0-17': [0, 17], '18-35': [18, 35], '36-55': [36, 55], '56-75': [56, 75], '76+': [76, 999] };
        const ages = Object.entries(ageGroups).map(([label, [min, max]]) => [label, members.filter(member => member.isAlive && member.birthYear && currentYear - member.birthYear >= min && currentYear - member.birthYear <= max)]).map(([label, group]) => [label, group.filter(member => member.gender === 0).length, group.filter(member => member.gender === 1).length]);
        const zodiac = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'].map((sign, index) => [sign, members.filter(member => member.birthYear && (member.birthYear - 4) % 12 === index).length]).filter(([, count]) => count > 0);
        return { male: members.filter(member => member.gender === 0).length, female: members.filter(member => member.gender === 1).length, alive: members.filter(member => member.isAlive).length, deceased: members.filter(member => !member.isAlive).length, generations: Object.entries(generations).sort((a, b) => Number(a[0]) - Number(b[0])), years: Object.entries(years).sort((a, b) => b[1] - a[1]).slice(0, 8), ages, zodiac };
    }, [members]);
    const maxGeneration = Math.max(...summary.generations.map(([, count]) => count), 1);
    const exportExcel = () => {
        const escapeHtml = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
        const table = (title, headers, rows) => `<h2>${escapeHtml(title)}</h2><table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        const gender = value => value === 0 ? 'Nam' : value === 1 ? 'Nữ' : 'Khác';
        const report = [
            table('Tổng quan dòng họ', ['Chỉ số', 'Giá trị'], [
                ['Tổng thành viên', members.length], ['Nam', summary.male], ['Nữ', summary.female], ['Còn sống', summary.alive], ['Đã mất', summary.deceased], ['Số thế hệ', summary.generations.length]
            ]),
            table('Phân bố độ tuổi', ['Nhóm tuổi', 'Nam', 'Nữ'], summary.ages),
            table('Phân bố theo đời', ['Đời', 'Số thành viên'], summary.generations.map(([generation, count]) => [`Đời ${generation}`, count])),
            table('Năm sinh phổ biến', ['Năm sinh', 'Số thành viên'], summary.years),
            table('Con giáp', ['Con giáp', 'Số thành viên'], summary.zodiac),
            table('Danh sách thành viên', ['Họ và tên', 'Giới tính', 'Đời', 'Năm sinh', 'Năm mất', 'Trạng thái'], members.map(member => [member.fullName, gender(member.gender), member.generationLevel || '', member.birthYear || '', member.deathYear || '', member.isAlive ? 'Còn sống' : 'Đã mất']))
        ].join('');
        const html = `<html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif}h1{color:#b5451b}h2{margin-top:22px;color:#3b6978}table{border-collapse:collapse;margin-bottom:18px;min-width:420px}th,td{border:1px solid #d8d0c5;padding:7px 10px;text-align:left}th{background:#f5f1ea;font-weight:bold}</style></head><body><h1>Thống kê dòng họ</h1><p>Ngày xuất: ${escapeHtml(new Date().toLocaleDateString('vi-VN'))} · Âm lịch: ${escapeHtml(formatLunarDate(new Date()))}</p>${report}</body></html>`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([`\ufeff${html}`], { type: 'application/vnd.ms-excel;charset=utf-8' }));
        link.download = 'thong-ke-dong-ho.xls';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return <div className="page"><Navbar /><main className="page-content">
        <div className="content-header-row"><div className="section-header"><h1 className="section-title">Thống kê dòng họ</h1><p className="section-sub">Tổng quan nhân khẩu và phân bố thành viên trong cây gia phả.</p></div><div className="content-header-actions"><button className="btn btn-secondary btn-sm" onClick={load}><IconRefresh /> Làm mới</button><button className="btn btn-secondary btn-sm" disabled={loading} onClick={exportExcel}><IconDownload /> Xuất Excel</button></div></div>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {loading ? <div style={{ textAlign: 'center', padding: 50, color: 'var(--color-text-muted)' }}>Đang tổng hợp dữ liệu...</div> : <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard label="Tổng thành viên" value={members.length} detail="Hồ sơ trong cây hiện tại" color="var(--color-primary)" />
                <StatCard label="Nam / Nữ" value={`${summary.male} / ${summary.female}`} detail={`${members.length ? Math.round(summary.male / members.length * 100) : 0}% nam`} color="#3b82f6" />
                <StatCard label="Còn sống" value={summary.alive} detail={`${summary.deceased} người đã mất`} color="#16a34a" />
                <StatCard label="Số thế hệ" value={summary.generations.length} detail="Theo thông tin hồ sơ" color="#d97706" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginBottom: 20 }}>
                <div className="card" style={{ padding: 22 }}><h2 style={{ fontSize: '1rem', margin: '0 0 14px' }}>Tỷ lệ giới tính</h2><div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><svg viewBox="0 0 42 42" width="150" height="150" style={{ transform: 'rotate(-90deg)' }}><circle cx="21" cy="21" r="15.9" fill="none" stroke="#ec4899" strokeWidth="8" /><circle cx="21" cy="21" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray={`${members.length ? summary.male / members.length * 100 : 0} ${members.length ? summary.female / members.length * 100 : 100}`} strokeDashoffset="0" /></svg><div><div style={{ color: '#3b82f6', fontWeight: 700 }}>Nam: {summary.male}</div><div style={{ color: '#ec4899', fontWeight: 700, marginTop: 8 }}>Nữ: {summary.female}</div></div></div></div>
                <div className="card" style={{ padding: 22 }}><h2 style={{ fontSize: '1rem', margin: '0 0 14px' }}>Tháp tuổi</h2>{summary.ages.map(([label, male, female]) => <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 42px 1fr', gap: 4, alignItems: 'center', marginBottom: 8 }}><div style={{ height: 10, background: '#3b82f6', width: `${male / Math.max(...summary.ages.map(age => Math.max(age[1], age[2])), 1) * 100}%`, justifySelf: 'end' }} /><span style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--color-text-muted)' }}>{label}</span><div style={{ height: 10, background: '#ec4899', width: `${female / Math.max(...summary.ages.map(age => Math.max(age[1], age[2])), 1) * 100}%` }} /></div>)}</div>
                <div className="card" style={{ padding: 22 }}><h2 style={{ fontSize: '1rem', margin: '0 0 14px' }}>Con giáp</h2>{summary.zodiac.length ? summary.zodiac.map(([sign, count]) => <div key={sign} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ width: 34 }}>{sign}</span><div style={{ height: 10, flex: 1, background: 'var(--color-surface-2)', borderRadius: 5 }}><div style={{ height: '100%', width: `${count / Math.max(...summary.zodiac.map(item => item[1]), 1) * 100}%`, background: '#d97706', borderRadius: 5 }} /></div><strong>{count}</strong></div>) : <span style={{ color: 'var(--color-text-muted)' }}>Chưa có năm sinh.</span>}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                <div className="card" style={{ padding: 22 }}><h2 style={{ fontSize: '1rem', margin: '0 0 18px' }}>Phân bố theo đời</h2>{summary.generations.map(([generation, count]) => <div key={generation} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 40px', alignItems: 'center', gap: 10, marginBottom: 12 }}><span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Đời {generation}</span><div style={{ height: 12, background: 'var(--color-surface-2)', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${count / maxGeneration * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 6 }} /></div><strong style={{ textAlign: 'right' }}>{count}</strong></div>)}</div>
                <div className="card" style={{ padding: 22 }}><h2 style={{ fontSize: '1rem', margin: '0 0 18px' }}>Năm sinh phổ biến</h2>{summary.years.length ? summary.years.map(([year, count]) => <div key={year} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.88rem' }}><span>{year}</span><strong>{count} thành viên</strong></div>) : <div style={{ color: 'var(--color-text-muted)' }}>Chưa có dữ liệu năm sinh.</div>}</div>
            </div>
        </>}
    </main></div>;
}
