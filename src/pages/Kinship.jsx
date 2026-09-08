import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import memberService from '../services/memberService';

export default function Kinship() {
    const [members, setMembers] = useState([]);
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => { memberService.getMembers().then(setMembers).catch(() => setError('Không thể tải danh sách thành viên.')).finally(() => setLoading(false)); }, []);
    const lookup = async () => {
        if (!fromId || !toId || fromId === toId) return;
        setError(''); setResult(null);
        try { setResult(await memberService.getKinship(fromId, toId)); } catch (exception) { setError(exception.response?.data?.message || 'Không thể tra cứu danh xưng.'); }
    };
    const nameOf = id => members.find(member => member.id === id)?.fullName || '';
    useEffect(() => { lookup(); }, [fromId, toId]);
    return <div className="page"><Navbar /><main className="page-content">
        <div className="section-header"><h1 className="section-title">Tra cứu danh xưng</h1><p className="section-sub">Chọn hai thành viên để xem cách xưng hô và liên kết trong dòng tộc.</p></div>
        <div className="card" style={{ padding: 24, maxWidth: 900, margin: '0 auto 20px' }}><div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'end' }}><label>Người A<select className="input" value={fromId} onChange={event => setFromId(event.target.value)} disabled={loading}><option value="">Chọn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label><div style={{ fontSize: '1.5rem', color: 'var(--color-primary)', textAlign: 'center', paddingBottom: 8 }}>↔</div><label>Người B<select className="input" value={toId} onChange={event => setToId(event.target.value)} disabled={loading}><option value="">Chọn thành viên</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label></div>{loading && <div style={{ marginTop: 14, color: 'var(--color-text-muted)', textAlign: 'center' }}>Đang tra cứu...</div>}</div>
        {error && <div className="alert alert-error" style={{ maxWidth: 900, margin: '0 auto 20px' }}>{error}</div>}
        {result && <div className="card" style={{ maxWidth: 900, margin: '0 auto', padding: 28 }}><div style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 22 }}>{result.description}</div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><div style={{ padding: 18, background: 'var(--color-surface-2)', borderRadius: 10 }}><div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', textTransform: 'uppercase' }}>{nameOf(fromId)} gọi {nameOf(toId)}</div><strong style={{ display: 'block', fontSize: '1.4rem', marginTop: 8 }}>{result.aCallsB}</strong></div><div style={{ padding: 18, background: 'var(--color-surface-2)', borderRadius: 10 }}><div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', textTransform: 'uppercase' }}>{nameOf(toId)} gọi {nameOf(fromId)}</div><strong style={{ display: 'block', fontSize: '1.4rem', marginTop: 8 }}>{result.bCallsA}</strong></div></div>{result.pathLabels?.length > 0 && <div style={{ marginTop: 22, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>{result.pathLabels.map((label, index) => <div key={`${label}-${index}`} style={{ padding: '6px 0', color: 'var(--color-text-secondary)' }}>• {label}</div>)}</div>}</div>}
    </main></div>;
}
