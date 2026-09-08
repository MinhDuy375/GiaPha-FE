/**
 * Thuật toán xây dựng layout cây gia phả từ danh sách members và relationships.
 * Tham khảo logic từ giapha-os (github.com/homielab/giapha-os).
 *
 * Output: Danh sách nodes với tọa độ (x, y) để render SVG/Canvas.
 */

const NODE_WIDTH = 160;
const NODE_HEIGHT = 150;   // tăng nhẹ để chứa avatar to hơn
const H_SPACING = 40;      // Khoảng cách ngang giữa các node (không cùng cặp chính)
const V_SPACING = 80;      // Khoảng cách dọc giữa các thế hệ
const RING_GAP = 30;       // Khoảng hở giữa 2 nửa của thẻ vợ chồng gộp chung (chỗ đặt icon nhẫn)
const AVATAR_RADIUS = 32;  // bán kính avatar trong thẻ (trước đây 25)

// Kích thước thẻ ở chế độ tối giản (chỉ hiện tên) — nhỏ hơn nhiều so với thẻ đầy đủ có avatar.
const MINIMAL_NODE_HEIGHT = 52;
const MINIMAL_CHAR_WIDTH = 8.2;   // ước lượng bề rộng trung bình / ký tự ở fontSize 14 700-weight
const MINIMAL_PADDING_X = 28;     // đệm 2 bên trong thẻ
const MINIMAL_MIN_WIDTH = 90;
const MINIMAL_MAX_WIDTH = 220;

/**
 * Ước lượng bề rộng thẻ tối giản vừa khít theo tên (chia dòng dài thành nhiều dòng nếu cần
 * được xử lý ở phía component; ở đây chỉ ước lượng theo dòng dài nhất trong tên).
 */
export function measureMinimalCardWidth(fullName) {
  const name = (fullName || '').trim();
  if (!name) return MINIMAL_MIN_WIDTH;
  // Nếu tên có nhiều từ, giả định có thể ngắt dòng ở khoảng trắng gần giữa nhất để tránh thẻ quá rộng.
  const words = name.split(/\s+/);
  let longest = name;
  if (words.length > 2) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    longest = line1.length >= line2.length ? line1 : line2;
  }
  const estimated = longest.length * MINIMAL_CHAR_WIDTH + MINIMAL_PADDING_X;
  return Math.min(MINIMAL_MAX_WIDTH, Math.max(MINIMAL_MIN_WIDTH, Math.round(estimated)));
}

function isMale(gender) {
  return gender === 'male' || gender === 0 || gender === '0';
}
function isFemale(gender) {
  return gender === 'female' || gender === 1 || gender === '1';
}

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
 * Lọc members/relationships theo bộ lọc hiển thị (ẩn dâu/rể, ẩn nam/nữ, giới hạn số đời).
 * Trả về danh sách đã lọc hẳn (không chừa khoảng trống) để computeTreeLayout bố cục lại từ đầu.
 *
 * filters: {
 *   hideInLaw?: boolean,
 *   hideMale?: boolean,
 *   hideFemale?: boolean,
 *   maxGeneration?: number | null   // chỉ hiện đời 1..maxGeneration
 * }
 */
export function filterTreeData(members, relationships, filters = {}) {
  const { hideInLaw = false, hideMale = false, hideFemale = false, maxGeneration = null } = filters;
  const safeMembers = Array.isArray(members) ? members.filter(Boolean) : [];

  const keptMembers = safeMembers.filter(m => {
    if (hideInLaw && (m.is_in_law === true || m.is_in_law === 1)) return false;
    if (hideMale && isMale(m.gender)) return false;
    if (hideFemale && isFemale(m.gender)) return false;
    if (maxGeneration != null && Number(m.generation ?? 1) > Number(maxGeneration)) return false;
    return true;
  });

  const keptIds = new Set(keptMembers.map(m => m.id));
  const keptRelationships = (Array.isArray(relationships) ? relationships : [])
    .filter(r => r && keptIds.has(r.person_a) && keptIds.has(r.person_b));

  return { members: keptMembers, relationships: keptRelationships };
}

/**
 * Layout thuật toán đơn giản: xếp theo thế hệ (generation)
 * Sắp xếp các node theo level, tính x từ trái sang phải theo từng thế hệ.
 * Vợ/chồng "chính" (người đầu tiên tìm thấy) được ghép sát nhau để hiển thị chung 1 thẻ.
 */
export function computeTreeLayout(members, relationships, options = {}) {
  if (!Array.isArray(members) || members.length === 0) return { nodes: [], edges: [] };

  const { minimal = false } = options;
  const cardHeight = minimal ? MINIMAL_NODE_HEIGHT : NODE_HEIGHT;
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

  // Xác định trước cặp vợ chồng "chính" để biết node nào sẽ hiển thị thành thẻ đôi (rộng hơn),
  // dùng ngay từ bước đặt tọa độ ban đầu lẫn bước chống đè, tránh việc thẻ đôi lấn sang node kế bên.
  const primaryPartnerOfEarly = new Map(); // personId -> partnerId
  const claimedAsPrimaryEarly = new Set();
  for (const member of safeMembers) {
    if (claimedAsPrimaryEarly.has(member.id)) continue;
    const spouseIds = spousesByPersonId.get(member.id) || [];
    const partnerId = spouseIds.find(sid => {
      if (claimedAsPrimaryEarly.has(sid)) return false;
      const partner = memberMap.get(sid);
      if (!partner) return false;
      return (partner.generation ?? 1) === (member.generation ?? 1);
    });
    if (partnerId) {
      primaryPartnerOfEarly.set(member.id, partnerId);
      primaryPartnerOfEarly.set(partnerId, member.id);
      claimedAsPrimaryEarly.add(member.id);
      claimedAsPrimaryEarly.add(partnerId);
    }
  }

  // Bề rộng riêng của từng thẻ: cố định (NODE_WIDTH) ở chế độ đầy đủ, hoặc vừa khít theo tên ở chế độ tối giản.
  // Nếu 2 người là cặp vợ chồng chính, cả 2 dùng CHUNG 1 bề rộng (lấy max của 2 người) để 2 nửa thẻ bằng nhau.
  const ownWidthOf = (memberId) => {
    if (!minimal) return NODE_WIDTH;
    return measureMinimalCardWidth(memberMap.get(memberId)?.full_name);
  };
  const widthOf = (memberId) => {
    const partnerId = primaryPartnerOfEarly.get(memberId);
    if (partnerId == null) return ownWidthOf(memberId);
    return Math.max(ownWidthOf(memberId), ownWidthOf(partnerId));
  };

  // Gom thành viên mỗi thế hệ thành các "khối" (cặp vợ chồng chính = 1 khối gồm 2 thẻ,
  // còn lại mỗi người 1 khối) để đặt tọa độ ban đầu không chồng lấn ngay từ đầu.
  // Mỗi thành viên trong khối giữ bề rộng riêng (widthOf) — quan trọng ở chế độ tối giản vì tên dài ngắn khác nhau.
  const buildBlocks = (genMembers) => {
    const seen = new Set();
    const blocks = [];
    for (const member of genMembers) {
      if (seen.has(member.id)) continue;
      const partnerId = primaryPartnerOfEarly.get(member.id);
      const partner = partnerId != null ? memberMap.get(partnerId) : null;
      const partnerInSameGen = partner && genMembers.some(m => m.id === partner.id);
      if (partnerInSameGen) {
        seen.add(member.id);
        seen.add(partner.id);
        const width = widthOf(member.id) + widthOf(partner.id) + RING_GAP;
        blocks.push({ members: [member, partner], width });
      } else {
        seen.add(member.id);
        blocks.push({ members: [member], width: widthOf(member.id) });
      }
    }
    return blocks;
  };

  // Đặt tọa độ theo generation (đơn giản - dàn hàng ngang), theo khối để cặp vợ chồng không đè lên node kế bên.
  sortedGens.forEach((gen, genIndex) => {
    const genMembers = generationMap.get(gen) || [];
    const y = genIndex * (cardHeight + V_SPACING);
    const blocks = buildBlocks(genMembers);
    const totalWidth = blocks.reduce((sum, b) => sum + b.width, 0) + H_SPACING * Math.max(blocks.length - 1, 0);
    let cursor = -totalWidth / 2;

    for (const block of blocks) {
      let memberCursor = cursor;
      for (const member of block.members) {
        if (!placed.has(member.id)) {
          positionMap.set(member.id, { x: memberCursor, y });
          placed.add(member.id);
        }
        memberCursor += widthOf(member.id) + RING_GAP;
      }
      cursor += block.width + H_SPACING;
    }
  });

  // Nắn các node con về phía trung tâm của cha/mẹ, sau đó giãn các node trùng lớp.
  // Cách này giữ được nhiều gốc độc lập mà không cần giả định dữ liệu luôn là cây hoàn hảo.
  // Các cặp vợ chồng chính được xử lý như MỘT khối duy nhất để tính khoảng cách,
  // tránh việc thẻ đôi (rộng gấp đôi) đè lên node liền kề.
  for (const gen of sortedGens.slice(1)) {
    const genMembers = generationMap.get(gen);

    // Gom các thành viên thành "khối" (cặp vợ chồng chính = 1 khối, còn lại mỗi người 1 khối)
    const seenInBlock = new Set();
    const blocks = [];
    for (const member of genMembers) {
      if (seenInBlock.has(member.id)) continue;
      const partnerId = primaryPartnerOfEarly.get(member.id);
      const partner = partnerId != null ? memberMap.get(partnerId) : null;
      const partnerInSameGen = partner && genMembers.some(m => m.id === partner.id);
      if (partnerInSameGen) {
        seenInBlock.add(member.id);
        seenInBlock.add(partner.id);
        const width = widthOf(member.id) + widthOf(partner.id) + RING_GAP;
        blocks.push({ members: [member, partner], width });
      } else {
        seenInBlock.add(member.id);
        blocks.push({ members: [member], width: widthOf(member.id) });
      }
    }

    const desired = blocks.map(block => {
      const parentPositions = block.members.flatMap(member =>
        (parentsByPersonId.get(member.id) || [])
          .map(parentId => positionMap.get(parentId)?.x)
          .filter(x => x != null)
      );
      const anchorX = parentPositions.length > 0
        ? parentPositions.reduce((sum, x) => sum + x, 0) / parentPositions.length
        : positionMap.get(block.members[0].id)?.x ?? 0;
      return { block, x: anchorX };
    }).sort((a, b) => a.x - b.x);

    let previousRight = Number.NEGATIVE_INFINITY;
    for (const item of desired) {
      const left = Math.max(item.x - item.block.width / 2, previousRight + H_SPACING);
      let cursor = left;
      for (const member of item.block.members) {
        positionMap.set(member.id, { x: cursor, y: positionMap.get(member.id)?.y ?? 0 });
        cursor += widthOf(member.id) + RING_GAP;
      }
      previousRight = left + item.block.width;
    }

    // Keep each generation centered after collision spacing, producing a stable pyramid.
    // Dùng chiều rộng thực của từng khối (thẻ đôi rộng hơn thẻ đơn) để tính biên phải chính xác.
    if (blocks.length > 0) {
      const lefts = desired.map(item => positionMap.get(item.block.members[0].id)?.x ?? 0);
      const rights = desired.map(item => {
        const leadPos = positionMap.get(item.block.members[0].id);
        return (leadPos?.x ?? 0) + item.block.width;
      });
      const left = Math.min(...lefts);
      const right = Math.max(...rights);
      const offset = -(left + right) / 2;
      for (const member of genMembers) {
        const position = positionMap.get(member.id);
        if (position) position.x += offset;
      }
    }
  }

  // Xác định cặp vợ chồng "chính" của mỗi người (chỉ 1 cặp/người) để gộp chung 1 thẻ.
  // Người có thêm vợ/chồng khác (đa thê/tái hôn) vẫn giữ thẻ riêng, nối bằng nhẫn như trước.
  const primaryPartnerOf = new Map(); // personId -> partnerId
  const claimedAsPrimary = new Set();
  for (const member of safeMembers) {
    if (claimedAsPrimary.has(member.id)) continue;
    const spouseIds = spousesByPersonId.get(member.id) || [];
    const partnerId = spouseIds.find(sid => {
      if (claimedAsPrimary.has(sid)) return false;
      const partner = memberMap.get(sid);
      if (!partner) return false;
      return (partner.generation ?? 1) === (member.generation ?? 1);
    });
    if (partnerId) {
      primaryPartnerOf.set(member.id, partnerId);
      primaryPartnerOf.set(partnerId, member.id);
      claimedAsPrimary.add(member.id);
      claimedAsPrimary.add(partnerId);
    }
  }

  // Keep spouses side by side so their shared descendant branch has one visual origin.
  // Cặp chính được ghép sát (RING_GAP) để hiển thị thành 1 thẻ; cặp phụ giữ khoảng cách như node thường.
  const paired = new Set();
  for (const [personId, spouseIds] of spousesByPersonId) {
    for (const spouseId of spouseIds) {
      const pairKey = [personId, spouseId].sort().join('-');
      if (paired.has(pairKey)) continue;
      paired.add(pairKey);
      const first = positionMap.get(personId);
      const second = positionMap.get(spouseId);
      if (!first || !second || first.y !== second.y) continue;
      const isPrimaryPair = primaryPartnerOf.get(personId) === spouseId;
      const gap = isPrimaryPair ? RING_GAP : H_SPACING;
      const left = Math.min(first.x, second.x);
      first.x = left;
      second.x = left + widthOf(personId) + gap;
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

    const partnerId = primaryPartnerOf.get(m.id) || null;
    const partnerMember = partnerId ? memberMap.get(partnerId) : null;
    const partnerPos = partnerId ? positionMap.get(partnerId) : null;
    const isCoupleLead = !!(partnerId && partnerPos && pos.x <= partnerPos.x);
    const ownWidth = widthOf(m.id);
    const coupleWidth = isCoupleLead && partnerPos
      ? (partnerPos.x + widthOf(partnerId) - pos.x)
      : ownWidth;

    return {
      ...m,
      x: pos.x,
      y: pos.y,
      width: ownWidth,
      height: cardHeight,
      spouses,
      children,
      parents,
      partnerId,
      partnerData: isCoupleLead ? partnerMember : null,
      isCoupleLead,
      // true nếu node này bị "gộp" vào thẻ của partner (không cần vẽ thẻ riêng)
      mergedIntoPartner: !!(partnerId && !isCoupleLead),
      coupleWidth,
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

    // Cặp vợ chồng chính đã được gộp chung 1 thẻ (nhẫn vẽ ngay trong thẻ) -> không cần vẽ đường nối riêng.
    if (rel.type === 'marriage' && primaryPartnerOf.get(rel.person_a) === rel.person_b) continue;

    const widthA = widthOf(rel.person_a);
    const widthB = widthOf(rel.person_b);
    let parentX = posA.x + widthA / 2;
    let parentY = posA.y + cardHeight;
    if (rel.type !== 'marriage') {
      const spouseId = (spousesByPersonId.get(rel.person_a) || []).find(id => positionMap.get(id)?.y === posA.y);
      const spousePosition = spouseId ? positionMap.get(spouseId) : null;
      if (spousePosition) parentX = (parentX + spousePosition.x + widthOf(spouseId) / 2) / 2;
    }

    edges.push({
      id: key,
      type: rel.type,
      fromId: rel.person_a,
      toId: rel.person_b,
      x1: rel.type === 'marriage' ? posA.x + widthA / 2 : parentX,
      y1: rel.type === 'marriage' ? posA.y + cardHeight / 2 : parentY,
      x2: posB.x + widthB / 2,
      y2: rel.type === 'marriage' ? posB.y + cardHeight / 2 : posB.y,
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

export { NODE_WIDTH, NODE_HEIGHT, H_SPACING, V_SPACING, RING_GAP, AVATAR_RADIUS, MINIMAL_NODE_HEIGHT };