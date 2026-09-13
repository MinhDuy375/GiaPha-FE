import { useRef, useState, useCallback } from 'react';
import { FamilyNode } from './FamilyNode';

export function buildTreeAdj(members, relationships) {
  const spousesByPersonId = new Map();
  const childrenByPersonId = new Map();
  const parentsByPersonId = new Map();
  const seenMarriage = new Set();

  for (const rel of relationships || []) {
    if (!rel?.person_a || !rel?.person_b) continue;

    if (rel.type === 'marriage') {
      const key = [rel.person_a, rel.person_b].sort().join('|');
      if (seenMarriage.has(key)) continue;
      seenMarriage.add(key);
      if (!spousesByPersonId.has(String(rel.person_a))) spousesByPersonId.set(String(rel.person_a), []);
      if (!spousesByPersonId.has(String(rel.person_b))) spousesByPersonId.set(String(rel.person_b), []);
      spousesByPersonId.get(String(rel.person_a)).push({ spouseId: rel.person_b, note: rel.note });
      spousesByPersonId.get(String(rel.person_b)).push({ spouseId: rel.person_a, note: rel.note });
    }

    const isParentChild = rel.type === 'parent' || rel.type === 'biological_child' || rel.type === 'adopted_child';
    if (isParentChild) {
      if (!childrenByPersonId.has(String(rel.person_a))) childrenByPersonId.set(String(rel.person_a), []);
      childrenByPersonId.get(String(rel.person_a)).push(String(rel.person_b));
      if (!parentsByPersonId.has(String(rel.person_b))) parentsByPersonId.set(String(rel.person_b), []);
      parentsByPersonId.get(String(rel.person_b)).push(String(rel.person_a));
    }
  }
  return { spousesByPersonId, childrenByPersonId, parentsByPersonId };
}

function findRoots(members, adj) {
  const { parentsByPersonId, childrenByPersonId, spousesByPersonId } = adj;

  // People with no parents
  const noParentIds = new Set(
    members.filter(m => (parentsByPersonId.get(String(m.id)) || []).length === 0).map(m => String(m.id))
  );

  const excludedFromRoot = new Set();

  // Rule 1: If person X has no parents, but is married to person Y who HAS parents
  //         → X is "married-in" and should NOT be a root (they appear inside Y's node)
  for (const id of noParentIds) {
    const spouses = spousesByPersonId.get(id) || [];
    for (const s of spouses) {
      const spouseId = String(s.spouseId);
      if (!noParentIds.has(spouseId)) {
        // Spouse has parents → I am married-in → exclude me from roots
        excludedFromRoot.add(id);
        break;
      }
    }
  }

  // Rule 2: For couples where BOTH have no parents → pick one as primary by children count or lower ID
  const seenPairs = new Set();
  for (const id of noParentIds) {
    if (excludedFromRoot.has(id)) continue;
    const spouses = spousesByPersonId.get(id) || [];
    for (const s of spouses) {
      const spouseId = String(s.spouseId);
      if (!noParentIds.has(spouseId) || excludedFromRoot.has(spouseId)) continue;
      const pairKey = [id, spouseId].sort().join('|');
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      const aChildren = (childrenByPersonId.get(id) || []).length;
      const bChildren = (childrenByPersonId.get(spouseId) || []).length;
      let secondary;
      if (aChildren > bChildren) secondary = spouseId;
      else if (bChildren > aChildren) secondary = id;
      else secondary = Number(id) <= Number(spouseId) ? spouseId : id;
      excludedFromRoot.add(secondary);
    }
  }

  const roots = members.filter(m => {
    const id = String(m.id);
    return noParentIds.has(id) && !excludedFromRoot.has(id);
  });

  if (roots.length === 0 && members.length > 0) return members.slice(0, 1);
  return roots;
}


export default function RecursiveTree({ members, relationships, filters, searchTerm, selectedMember, onMemberSelect, exportRef, staticMode = false, highlightNodes = [] }) {
  const containerRef = useRef(null);
  
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  const toggleCollapse = useCallback((id) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const personsMap = new Map(members.map(m => [String(m.id), m]));
  const adj = buildTreeAdj(members, relationships);
  const roots = findRoots(members, adj);

  const visibleRoots = roots.filter(r => {
    const gen = r.generation || r.generationLevel || 1;
    if (filters.maxGeneration && gen > filters.maxGeneration) return false;
    // Do not hide roots based on gender or inLaw to prevent the entire tree from disappearing
    return true;
  });

  const ctx = {
    staticMode,
    highlightNodes,
    personsMap, adj, filters, searchTerm,
    selectedId: selectedMember ? String(selectedMember.id) : null,
    onSelect: onMemberSelect,
    collapsedNodes, toggleCollapse,
  };

  const changeScale = (delta) => setScale(s => Math.min(2.5, Math.max(0.3, parseFloat((s + delta).toFixed(2)))));
  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    setIsPanning(true);
  };
  const handleMouseMove = (e) => {
    if (!isPanning || !panStart.current) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };
  const handleMouseUp = () => { setIsPanning(false); panStart.current = null; };

  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX - pan.x, y: t.clientY - pan.y };
  };
  const handleTouchMove = (e) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    setPan({ x: t.clientX - touchStart.current.x, y: t.clientY - touchStart.current.y });
  };
  const handleTouchEnd = () => { touchStart.current = null; };

  if (staticMode) {
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', overflowX: 'auto', background: '#FAF7F1', width: '100%', height: '100%' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'flex-start', gap: 40, minWidth: 'max-content' }}>
          <style>{`
            .ft-person-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(43,33,27,0.16) !important; }
            .ft-node-container { user-select: none; }
          `}</style>
          {visibleRoots.map(root => <FamilyNode key={root.id} personId={root.id} level={0} isLast={true} ctx={ctx} />)}
          {visibleRoots.length === 0 && members.length > 0 && (
            <div style={{ color: '#756A61', fontStyle: 'italic', padding: 16 }}>Không có kết quả phù hợp với bộ lọc.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#FAF7F1' }}
      ref={containerRef}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <div style={{
        position: 'absolute', bottom: 20, right: 20, zIndex: 20,
        display: 'flex', gap: 8, alignItems: 'center',
        background: '#FFFFFF', border: '1px solid #E7DED4',
        borderRadius: 14, padding: '6px 10px', boxShadow: '0 4px 16px rgba(43,33,27,0.10)'
      }}>
        <button className="ft-btn-icon" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, border: 'none' }} onClick={() => changeScale(-0.1)} title="Thu nhỏ">−</button>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2B211B', minWidth: 40, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
        <button className="ft-btn-icon" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, border: 'none' }} onClick={() => changeScale(0.1)} title="Phóng to">+</button>
        <button className="ft-btn-icon" style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, border: 'none', fontSize: 12 }} onClick={resetView} title="Đặt lại">⟳</button>
      </div>

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', cursor: isPanning ? 'grabbing' : 'grab' }}>
        <div id="family-tree-export-root" ref={exportRef} style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'top left',
          padding: '40px 60px', display: 'inline-flex', flexDirection: 'row',
          alignItems: 'flex-start', gap: 40, background: '#FAF7F1', minWidth: 'max-content'
        }}>
          <style>{`
            .ft-person-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(43,33,27,0.16) !important; }
            .ft-node-container { user-select: none; }
          `}</style>
          {visibleRoots.map(root => <FamilyNode key={root.id} personId={root.id} level={0} isLast={true} ctx={ctx} />)}
          {visibleRoots.length === 0 && members.length > 0 && (
            <div style={{ color: '#756A61', fontStyle: 'italic', padding: 16 }}>Không có kết quả phù hợp với bộ lọc.</div>
          )}
        </div>
      </div>
    </div>
  );
}
