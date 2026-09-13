import { memo } from 'react';
import { API_ORIGIN } from '../services/api';

function genderColors(gender) {
  if (gender === 'male' || gender === 0) return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' };
  if (gender === 'female' || gender === 1) return { bg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D' };
  return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' };
}

function PersonAvatar({ person, size = 56 }) {
  const url = person.avatar_url || person.avatarUrl;
  const src = url ? (url.startsWith('http') ? url : `${API_ORIGIN}${url}`) : null;
  const c = genderColors(person.gender);

  // Default avatar by gender
  const isFemale = person.gender === 'female' || person.gender === 1;
  const defaultSrc = isFemale ? '/women.jpg' : '/man.jpg';

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      border: `3px solid ${c.border}`,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <img
        src={src || defaultSrc}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.currentTarget.src = defaultSrc; }}
      />
    </div>
  );
}

function PersonCard({ person, isSelected, onSelect, searchTerm, minimal, isHighlightedNode }) {
  const name = person.full_name || person.fullName || '(Chưa rõ)';
  const c = genderColors(person.gender);
  const isDeceased = person.isAlive === false || person.is_deceased;
  const highlight = (searchTerm && name.toLowerCase().includes(searchTerm.toLowerCase())) || isHighlightedNode;

  return (
    <div
      onClick={() => onSelect(person)}
      className="ft-person-card"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: minimal ? 2 : 8,
        padding: minimal ? '6px 8px' : '12px 10px 10px',
        borderRadius: minimal ? 8 : 18,
        background: isSelected ? '#FEF3ED' : (isHighlightedNode ? '#FEFCE8' : '#FFFFFF'),
        border: `2px solid ${isSelected ? '#B84D20' : highlight ? '#F59E0B' : c.border}`,
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 4px 16px rgba(184,77,32,0.22)'
          : (isHighlightedNode ? '0 0 0 4px #FDE68A' : '0 2px 10px rgba(43,33,27,0.07)'),
        transition: 'all 0.18s ease',
        width: minimal ? 90 : 100,
        opacity: isDeceased ? 0.72 : 1,
        position: 'relative', flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {!minimal && <PersonAvatar person={person} size={54} />}
      <div style={{
        fontSize: '0.78rem', fontWeight: 700, color: '#2B211B',
        textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word',
        width: '100%'
      }}>
        {name}
      </div>
      {isDeceased && (
        <div style={{
          position: 'absolute', top: -6, right: -6, width: 18, height: 18,
          borderRadius: '50%', background: '#6B7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: '#fff', fontWeight: 700, border: '2px solid #FAF7F1'
        }}>✝</div>
      )}
    </div>
  );
}

// Couple wrapper — bọc vợ chồng trong 1 thẻ chung để nhánh cây nối vào chính giữa
function FamilyUnit({ person, spouses, isSelected, selectedId, onSelect, searchTerm, minimal, ctx }) {
  const hasCouples = spouses.length > 0;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: hasCouples ? '#ffffffff' : 'transparent',
      border: hasCouples ? '1.5px dashed #E7DED4' : 'none',
      borderRadius: hasCouples ? 22 : 0,
      padding: hasCouples ? '3px 4px' : 0,
      gap: 0,
    }}>
      <PersonCard person={person} isSelected={isSelected} onSelect={onSelect} searchTerm={searchTerm} minimal={minimal} isHighlightedNode={ctx?.highlightNodes?.includes(String(person.id))} />
      {spouses.map((sp, idx) => (
        <div key={sp.person.id ?? idx} style={{ display: 'flex', alignItems: 'center' }}>
          {/* Kết nối vợ chồng */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ width: 1, height: minimal ? 10 : 20, background: '#E7DED4' }} />
            <span style={{ fontSize: 16, lineHeight: 1 }}>💍</span>
            <div style={{ width: 1, height: minimal ? 10 : 20, background: '#E7DED4' }} />
          </div>
          <PersonCard person={sp.person} isSelected={selectedId === sp.person.id || selectedId === String(sp.person.id)} onSelect={onSelect} searchTerm={searchTerm} minimal={minimal} isHighlightedNode={ctx?.highlightNodes?.includes(String(sp.person.id))} />
        </div>
      ))}
    </div>
  );
}

export const FamilyNode = memo(function FamilyNode({ personId, level, isLast, ctx }) {
  const { personsMap, adj, filters, selectedId, onSelect, searchTerm, collapsedNodes, toggleCollapse } = ctx;
  const person = personsMap.get(String(personId));
  if (!person) return null;

  const { spousesByPersonId, childrenByPersonId } = adj;
  const rawSpouses = spousesByPersonId.get(String(personId)) || [];
  const spouseNodes = (filters.hideInLaw ? [] : rawSpouses)
    .map(s => ({ person: personsMap.get(String(s.spouseId)), note: s.note }))
    .filter(s => {
      if (!s.person) return false;
      if (filters.hideMale && (s.person.gender === 'male' || s.person.gender === 0)) return false;
      if (filters.hideFemale && (s.person.gender === 'female' || s.person.gender === 1)) return false;
      return true;
    });

  const selfChildIds = (childrenByPersonId.get(String(personId)) || []).map(c => String(c));
  const uniqueChildIds = [...new Set(selfChildIds)];

  const visibleChildren = uniqueChildIds.filter(childId => {
    const child = personsMap.get(childId);
    if (!child) return false;
    if (filters.maxGeneration) {
      const gen = child.generation || child.generationLevel || 1;
      if (gen > filters.maxGeneration) return false;
    }
    if (filters.hideInLaw && (child.isInLaw || child.is_in_law)) return false;
    if (filters.hideMale && (child.gender === 'male' || child.gender === 0)) return false;
    if (filters.hideFemale && (child.gender === 'female' || child.gender === 1)) return false;
    return true;
  });

  const hasChildren = visibleChildren.length > 0;
  const isCollapsed = collapsedNodes.has(String(personId));

  return (
    <div className="ft-node-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Person + spouses in shared wrapper */}
      <FamilyUnit
        person={person}
        spouses={spouseNodes}
        isSelected={selectedId === person.id || selectedId === String(person.id)}
        selectedId={selectedId}
        onSelect={onSelect}
        searchTerm={searchTerm}
        minimal={filters.minimalView}
        ctx={ctx}
      />

      {/* Vertical line + collapse button */}
      {hasChildren && !ctx.staticMode && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 2, height: 12, background: '#C8BEB5' }} />
          <button
            onClick={() => toggleCollapse(String(personId))}
            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '2px solid #C8BEB5', background: '#FFF',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 14, color: '#9CA3AF',
              padding: 0, lineHeight: 1, zIndex: 5,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            {isCollapsed ? '+' : '−'}
          </button>
          {!isCollapsed && <div style={{ width: 2, height: 18, background: '#C8BEB5' }} />}
        </div>
      )}

      {/* Children row */}
      {hasChildren && !isCollapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {visibleChildren.map((childId, index) => (
            <div key={childId} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'relative', padding: '0 24px', paddingTop: 18
            }}>
              {/* Horizontal connector */}
              {visibleChildren.length === 1 ? (
                <div style={{ position: 'absolute', top: 0, left: '50%', width: 2, height: 18, background: '#C8BEB5', transform: 'translateX(-50%)' }} />
              ) : index === 0 ? (
                <div style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: 18, borderTop: '2px solid #C8BEB5', borderLeft: '2px solid #C8BEB5', borderTopLeftRadius: 12 }} />
              ) : index === visibleChildren.length - 1 ? (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: 18, borderTop: '2px solid #C8BEB5', borderRight: '2px solid #C8BEB5', borderTopRightRadius: 12 }} />
              ) : (
                <>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#C8BEB5' }} />
                  <div style={{ position: 'absolute', top: 0, left: '50%', width: 2, height: 18, background: '#C8BEB5', transform: 'translateX(-50%)' }} />
                </>
              )}
              <FamilyNode personId={childId} level={level + 1} isLast={index === visibleChildren.length - 1} ctx={ctx} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
