/**
 * Thuật toán xây dựng layout cây gia phả từ danh sách members và relationships.
 * Tham khảo logic từ giapha-os (github.com/homielab/giapha-os).
 * 
 * Output: Danh sách nodes với tọa độ (x, y) để render SVG/Canvas.
 */

const NODE_WIDTH = 160;
const NODE_HEIGHT = 132;
const H_SPACING = 40;   // Khoảng cách ngang giữa các node
const V_SPACING = 80;   // Khoảng cách dọc giữa các thế hệ

/**
 * Xây dựng adjacency lists từ raw data
 */
export function buildAdjacencyLists(relationships) {
  const spousesByPersonId = new Map(); // personId -> [spouseId, ...]
  const childrenByPersonId = new Map(); // personId -> [childId, ...]
  const parentsByPersonId = new Map();  // personId -> [parentId, ...]
  const childOrderById = new Map(); // childId -> order

  for (const rel of Array.isArray(relationships) ? relationships : []) {
    if (!rel?.person_a || !rel?.person_b) continue;
    if (rel.type === 'marriage') {
      if (!spousesByPersonId.has(rel.person_a)) spousesByPersonId.set(rel.person_a, []);
      if (!spousesByPersonId.has(rel.person_b)) spousesByPersonId.set(rel.person_b, []);
      spousesByPersonId.get(rel.person_a).push(rel.person_b);
      spousesByPersonId.get(rel.person_b).push(rel.person_a);
    }

    if (rel.type === 'biological_child' || rel.type === 'adopted_child') {
      // person_a = parent, person_b = child
      if (!childrenByPersonId.has(rel.person_a)) childrenByPersonId.set(rel.person_a, []);
      childrenByPersonId.get(rel.person_a).push(rel.person_b);

      if (!parentsByPersonId.has(rel.person_b)) parentsByPersonId.set(rel.person_b, []);
      parentsByPersonId.get(rel.person_b).push(rel.person_a);
      if (rel.order != null) childOrderById.set(rel.person_b, rel.order);
    }
  }

  return { spousesByPersonId, childrenByPersonId, parentsByPersonId, childOrderById };
}

/**
 * Tìm các node gốc (không có cha mẹ trong cây)
 */
export function findRoots(members, parentsByPersonId) {
  return members.filter(m => !parentsByPersonId.has(m.id) || parentsByPersonId.get(m.id).length === 0);
}

/**
 * Layout thuật toán đơn giản: xếp theo thế hệ (generation)
 * Sắp xếp các node theo level, tính x từ trái sang phải theo từng thế hệ.
 */
export function computeTreeLayout(members, relationships) {
  if (!Array.isArray(members) || members.length === 0) return { nodes: [], edges: [] };

  const { spousesByPersonId, childrenByPersonId, parentsByPersonId, childOrderById } = buildAdjacencyLists(relationships);
  const safeMembers = members.filter(member => member?.id);
  const memberMap = new Map(safeMembers.map(m => [m.id, m]));

  // Gom nhóm theo generation level
  const generationMap = new Map();
  for (const m of safeMembers) {
    const gen = m.generation ?? 1;
    if (!generationMap.has(gen)) generationMap.set(gen, []);
    generationMap.get(gen).push(m);
  }

  const sortedGens = [...generationMap.keys()].sort((a, b) => a - b);
  const positionMap = new Map(); // id -> {x, y}
  const placed = new Set();

  // Đặt tọa độ theo generation (đơn giản - dàn hàng ngang)
  sortedGens.forEach((gen, genIndex) => {
    const genMembers = generationMap.get(gen) || [];
    const y = genIndex * (NODE_HEIGHT + V_SPACING);
    const totalWidth = genMembers.length * (NODE_WIDTH + H_SPACING) - H_SPACING;
    const startX = -totalWidth / 2;

    genMembers.forEach((m, i) => {
      if (!placed.has(m.id)) {
        positionMap.set(m.id, {
          x: startX + i * (NODE_WIDTH + H_SPACING),
          y
        });
        placed.add(m.id);
      }
    });
  });

  // Nắn các node con về phía trung tâm của cha/mẹ, sau đó giãn các node trùng lớp.
  // Cách này giữ được nhiều gốc độc lập mà không cần giả định dữ liệu luôn là cây hoàn hảo.
  for (const gen of sortedGens.slice(1)) {
    const genMembers = generationMap.get(gen);
    const desired = genMembers.map(member => {
      const parentPositions = (parentsByPersonId.get(member.id) || [])
        .map(parentId => positionMap.get(parentId)?.x)
        .filter(x => x != null);
      return {
        member,
        x: parentPositions.length > 0
          ? parentPositions.reduce((sum, x) => sum + x, 0) / parentPositions.length
          : positionMap.get(member.id)?.x ?? 0
      };
    }).sort((a, b) => a.x - b.x);

    let previousRight = Number.NEGATIVE_INFINITY;
    for (const item of desired) {
      const x = Math.max(item.x, previousRight + H_SPACING + NODE_WIDTH);
      positionMap.set(item.member.id, { x, y: positionMap.get(item.member.id)?.y ?? 0 });
      previousRight = x;
    }

    // Keep each generation centered after collision spacing, producing a stable pyramid.
    const placedMembers = genMembers.map(member => positionMap.get(member.id)).filter(Boolean);
    if (placedMembers.length > 0) {
      const left = Math.min(...placedMembers.map(position => position.x));
      const right = Math.max(...placedMembers.map(position => position.x + NODE_WIDTH));
      const offset = -(left + right) / 2;
      for (const member of genMembers) {
        const position = positionMap.get(member.id);
        if (position) position.x += offset;
      }
    }
  }

  // Keep spouses side by side so their shared descendant branch has one visual origin.
  const paired = new Set();
  for (const [personId, spouseIds] of spousesByPersonId) {
    for (const spouseId of spouseIds) {
      const pairKey = [personId, spouseId].sort().join('-');
      if (paired.has(pairKey)) continue;
      paired.add(pairKey);
      const first = positionMap.get(personId);
      const second = positionMap.get(spouseId);
      if (!first || !second || first.y !== second.y) continue;
      const left = Math.min(first.x, second.x);
      first.x = left;
      second.x = left + NODE_WIDTH + H_SPACING;
    }
  }

  // Xây dựng danh sách nodes
  const nodes = safeMembers.map(m => {
    const pos = positionMap.get(m.id) || { x: 0, y: 0 };
    const spouses = (spousesByPersonId.get(m.id) || []).map(sid => memberMap.get(sid)).filter(Boolean);
    const children = (childrenByPersonId.get(m.id) || [])
      .map(cid => memberMap.get(cid))
      .filter(Boolean)
      .sort((a, b) => (childOrderById.get(a.id) ?? Infinity) - (childOrderById.get(b.id) ?? Infinity)
        || (a.birth_year ?? Infinity) - (b.birth_year ?? Infinity));
    const parents = (parentsByPersonId.get(m.id) || []).map(pid => memberMap.get(pid)).filter(Boolean);

    return {
      ...m,
      x: pos.x,
      y: pos.y,
      spouses,
      children,
      parents
    };
  });

  // Xây dựng danh sách edges
  const edges = [];
  const addedEdges = new Set();

  for (const rel of Array.isArray(relationships) ? relationships : []) {
    if (!rel?.person_a || !rel?.person_b) continue;
    const key = `${rel.person_a}-${rel.person_b}-${rel.type}`;
    if (addedEdges.has(key)) continue;
    addedEdges.add(key);

    const posA = positionMap.get(rel.person_a);
    const posB = positionMap.get(rel.person_b);
    if (!posA || !posB) continue;

    let parentX = posA.x + NODE_WIDTH / 2;
    let parentY = posA.y + NODE_HEIGHT;
    if (rel.type !== 'marriage') {
      const spouseId = (spousesByPersonId.get(rel.person_a) || []).find(id => positionMap.get(id)?.y === posA.y);
      const spousePosition = spouseId ? positionMap.get(spouseId) : null;
      if (spousePosition) parentX = (parentX + spousePosition.x + NODE_WIDTH / 2) / 2;
    }

    edges.push({
      id: key,
      type: rel.type,
      fromId: rel.person_a,
      toId: rel.person_b,
      x1: rel.type === 'marriage' ? posA.x + NODE_WIDTH / 2 : parentX,
      y1: rel.type === 'marriage' ? posA.y + NODE_HEIGHT / 2 : parentY,
      x2: posB.x + NODE_WIDTH / 2,
      y2: rel.type === 'marriage' ? posB.y + NODE_HEIGHT / 2 : posB.y,
      order: rel.order,
    });
  }

  return { nodes, edges };
}

export const GENDER_COLORS = {
  male: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#60a5fa' },
  female: { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', text: '#f472b6' },
  other: { bg: 'rgba(107, 114, 128, 0.15)', border: '#6b7280', text: '#9ca3af' },
};

export { NODE_WIDTH, NODE_HEIGHT };
