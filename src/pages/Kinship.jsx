import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import memberService from '../services/memberService';
import RecursiveTree from '../components/RecursiveTree';

export default function Kinship() {
    const [treeData, setTreeData] = useState({ members: [], relationships: [] });
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [result, setResult] = useState(null);
    const [pathNodes, setPathNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        memberService.getTreeData()
            .then(data => {
                const normalized = {
                    members: Array.isArray(data?.members) ? data.members.filter(Boolean) : [],
                    relationships: Array.isArray(data?.relationships) ? data.relationships.filter(Boolean) : []
                };
                setTreeData(normalized);
            })
            .catch(() => setError('Không thể tải dữ liệu gia phả.'))
            .finally(() => setLoading(false));
    }, []);

    const lookup = async () => {
        if (!fromId || !toId || fromId === toId) return;
        setError(''); setResult(null); setPathNodes([]);
        try {
            const res = await memberService.getKinship(fromId, toId);
            setResult(res);

            // BFS để tìm đường đi ngắn nhất trong cây quan hệ
            const adj = new Map();
            for (const member of treeData.members) adj.set(member.id, new Set());
            for (const rel of treeData.relationships) {
                if (adj.has(rel.person_a) && adj.has(rel.person_b)) {
                    adj.get(rel.person_a).add(rel.person_b);
                    adj.get(rel.person_b).add(rel.person_a);
                }
            }

            const queue = [[fromId]];
            const visited = new Set([fromId]);
            let pathIds = [];
            while (queue.length > 0) {
                const path = queue.shift();
                const current = path[path.length - 1];
                if (current === toId) {
                    pathIds = path;
                    break;
                }
                if (adj.has(current)) {
                    for (const neighbor of adj.get(current)) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push([...path, neighbor]);
                        }
                    }
                }
            }

            if (pathIds.length > 0) {
                const pNodes = pathIds.map(id => treeData.members.find(m => m.id === id)).filter(Boolean);
                setPathNodes(pNodes);
            }
        } catch (exception) {
            setError(exception.response?.data?.message || 'Không thể tra cứu danh xưng.');
        }
    };

    const nameOf = id => treeData.members.find(m => m.id === id)?.full_name
        || treeData.members.find(m => m.id === id)?.fullName || '';

    useEffect(() => { lookup(); }, [fromId, toId]);

    // Lọc relationships chỉ dành cho các node trong path
    const pathRelationships = treeData.relationships.filter(r =>
        pathNodes.some(n => n.id === r.person_a) &&
        pathNodes.some(n => n.id === r.person_b)
    );

    return (
        <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
                <div className="section-header">
                    <h1 className="section-title">Tra cứu danh xưng</h1>
                    <p className="section-sub">Chọn hai thành viên để xem cách xưng hô và liên kết trong dòng tộc.</p>
                </div>

                <div className="card" style={{ padding: 24, maxWidth: 900, width: '100%', margin: '0 auto 20px', flexShrink: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'end' }}>
                        <label>Người A
                            <select className="input" value={fromId} onChange={e => setFromId(e.target.value)} disabled={loading}>
                                <option value="">Chọn thành viên</option>
                                {treeData.members.map(member => <option key={member.id} value={member.id}>{member.fullName || member.full_name}</option>)}
                            </select>
                        </label>
                        <div style={{ fontSize: '1.5rem', color: 'var(--color-primary)', textAlign: 'center', paddingBottom: 8 }}>⇄</div>
                        <label>Người B
                            <select className="input" value={toId} onChange={e => setToId(e.target.value)} disabled={loading}>
                                <option value="">Chọn thành viên</option>
                                {treeData.members.map(member => <option key={member.id} value={member.id}>{member.fullName || member.full_name}</option>)}
                            </select>
                        </label>
                    </div>
                    {loading && <div style={{ marginTop: 14, color: 'var(--color-text-muted)', textAlign: 'center' }}>Đang tải...</div>}
                </div>

                {error && <div className="alert alert-error" style={{ maxWidth: 900, margin: '0 auto 20px', flexShrink: 0 }}>{error}</div>}

                {result && (
                    <div className="card" style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: 28, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ textAlign: 'center', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 22, flexShrink: 0 }}>
                            {result.description}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flexShrink: 0 }}>
                            <div style={{ padding: 18, background: 'var(--color-surface-2)', borderRadius: 10 }}>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', textTransform: 'uppercase' }}>
                                    {nameOf(fromId)} gọi {nameOf(toId)} là
                                </div>
                                <strong style={{ display: 'block', fontSize: '1.4rem', marginTop: 8 }}>{result.aCallsB}</strong>
                            </div>
                            <div style={{ padding: 18, background: 'var(--color-surface-2)', borderRadius: 10 }}>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', textTransform: 'uppercase' }}>
                                    {nameOf(toId)} gọi {nameOf(fromId)} là
                                </div>
                                <strong style={{ display: 'block', fontSize: '1.4rem', marginTop: 8 }}>{result.bCallsA}</strong>
                            </div>
                        </div>

                        {result.pathLabels?.length > 0 && (
                            <div style={{ marginTop: 22, borderTop: '1px solid var(--color-border)', paddingTop: 16, flexShrink: 0 }}>
                                {result.pathLabels.map((label, index) => (
                                    <div key={`label-${index}`} style={{ padding: '6px 0', color: 'var(--color-text-secondary)' }}>
                                        → {label}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Cây trực quan thể hiện đường nối từ A đến B */}
                        {pathNodes.length > 0 && (
                            <div style={{ marginTop: 32, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--color-text)', flexShrink: 0 }}>
                                    Sơ đồ nhánh liên kết:
                                </h3>
                                <div style={{
                                    flex: 1, borderRadius: 12, overflow: 'auto',
                                    border: '1px solid var(--color-border)', position: 'relative',
                                    minHeight: 200
                                }}>
                                    <RecursiveTree
                                        members={pathNodes}
                                        relationships={pathRelationships}
                                        filters={{ minimalView: false, hideInLaw: false, hideMale: false, hideFemale: false }}
                                        searchTerm=""
                                        selectedMember={null}
                                        onMemberSelect={() => {}}
                                        staticMode={true}
                                        highlightNodes={[String(fromId), String(toId)]}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
