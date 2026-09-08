import * as XLSX from 'xlsx';

/**
 * Xuất danh sách thành viên ra file Excel đẹp (.xlsx)
 */
export const exportMembersToExcel = (members, treeTitle = 'Gia Phả') => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Danh sách thành viên
  const memberData = members.map((m, index) => ({
    'STT': index + 1,
    'Họ và tên': m.fullName || '',
    'Giới tính': m.gender === 0 ? 'Nam' : m.gender === 1 ? 'Nữ' : 'Khác',
    'Thế hệ (Đời)': m.generationLevel || 1,
    'Năm sinh': m.birthYear || '',
    'Năm mất': m.deathYear || '',
    'Trạng thái': m.isAlive ? 'Còn sống' : 'Đã mất',
    'Nghề nghiệp': m.occupation || '',
    'Nơi ở hiện tại': m.currentResidence || '',
    'Tiểu sử / Ghi chú': m.bio || ''
  }));

  const wsMembers = XLSX.utils.json_to_sheet(memberData);

  // Chỉnh độ rộng cột tự động
  const memberCols = [
    { wch: 6 },  // STT
    { wch: 25 }, // Họ tên
    { wch: 12 }, // Giới tính
    { wch: 14 }, // Thế hệ
    { wch: 12 }, // Năm sinh
    { wch: 12 }, // Năm mất
    { wch: 14 }, // Trạng thái
    { wch: 20 }, // Nghề nghiệp
    { wch: 28 }, // Nơi ở
    { wch: 35 }  // Ghi chú
  ];
  wsMembers['!cols'] = memberCols;

  XLSX.utils.book_append_sheet(wb, wsMembers, 'Danh sách Thành viên');

  // 2. Sheet Thống kê chung
  const total = members.length;
  const maleCount = members.filter(m => m.gender === 0).length;
  const femaleCount = members.filter(m => m.gender === 1).length;
  const aliveCount = members.filter(m => m.isAlive).length;
  const deceasedCount = total - aliveCount;
  const maxGen = members.reduce((max, m) => Math.max(max, m.generationLevel || 1), 1);

  const statsData = [
    { 'Chỉ số': 'Tên Gia Phả', 'Giá trị': treeTitle },
    { 'Chỉ số': 'Ngày xuất báo cáo', 'Giá trị': new Date().toLocaleDateString('vi-VN') },
    { 'Chỉ số': 'Tổng số thành viên', 'Giá trị': total },
    { 'Chỉ số': 'Số lượng Nam', 'Giá trị': maleCount },
    { 'Chỉ số': 'Số lượng Nữ', 'Giá trị': femaleCount },
    { 'Chỉ số': 'Số người còn sống', 'Giá trị': aliveCount },
    { 'Chỉ số': 'Số người đã mất', 'Giá trị': deceasedCount },
    { 'Chỉ số': 'Số thế hệ (Đời)', 'Giá trị': maxGen }
  ];

  const wsStats = XLSX.utils.json_to_sheet(statsData);
  wsStats['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsStats, 'Thống kê Tổng quan');

  // Tên file xuất
  const fileName = `GiaPha_${treeTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Tải file Excel mẫu để nhập hàng loạt thành viên
 */
export const downloadMemberTemplate = () => {
  const wb = XLSX.utils.book_new();

  // Sheet Hướng dẫn
  const guideData = [
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '' },
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '1. Cột "Họ và tên" là bắt buộc.' },
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '2. Cột "Giới tính": Nhập "Nam", "Nữ" hoặc "Khác".' },
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '3. Cột "Thế hệ": Nhập số nguyên (Ví dụ: 1, 2, 3...).' },
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '4. Cột "Năm sinh" & "Năm mất": Nhập số năm 4 chữ số (VD: 1965).' },
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '5. Cột "Trạng thái": Nhập "Còn sống" hoặc "Đã mất".' },
    { 'HƯỚNG DẪN NHẬP DỮ LIỆU THÀNH VIÊN GIA PHẢ': '6. Vui lòng không thay đổi tên các cột ở sheet "Dữ liệu nhập".' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Hướng dẫn');

  // Sheet Dữ liệu mẫu
  const sampleData = [
    {
      'Họ và tên': 'Nguyễn Văn An',
      'Giới tính': 'Nam',
      'Thế hệ': 1,
      'Năm sinh': 1940,
      'Năm mất': 2015,
      'Trạng thái': 'Đã mất',
      'Nghề nghiệp': 'Giáo viên',
      'Nơi ở hiện tại': 'Hà Nội',
      'Ghi chú': 'Cụ tổ chi 1'
    },
    {
      'Họ và tên': 'Trần Thị Bình',
      'Giới tính': 'Nữ',
      'Thế hệ': 1,
      'Năm sinh': 1943,
      'Năm mất': '',
      'Trạng thái': 'Còn sống',
      'Nghề nghiệp': 'Nội trợ',
      'Nơi ở hiện tại': 'Hà Nội',
      'Ghi chú': ''
    },
    {
      'Họ và tên': 'Nguyễn Văn Cường',
      'Giới tính': 'Nam',
      'Thế hệ': 2,
      'Năm sinh': 1970,
      'Năm mất': '',
      'Trạng thái': 'Còn sống',
      'Nghề nghiệp': 'Kỹ sư',
      'Nơi ở hiện tại': 'TP. Hồ Chí Minh',
      'Ghi chú': 'Con trai trưởng'
    }
  ];

  const wsSample = XLSX.utils.json_to_sheet(sampleData);
  wsSample['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 14 }, { wch: 20 }, { wch: 25 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSample, 'Dữ liệu nhập');

  XLSX.writeFile(wb, 'Mau_Nhap_Thanh_Vien_Gia_Pha.xlsx');
};

/**
 * Đọc và parse dữ liệu từ file Excel upload
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Ưu tiên sheet 'Dữ liệu nhập' hoặc sheet đầu tiên không phải 'Hướng dẫn'
        let sheetName = workbook.SheetNames.find(name => name.includes('Dữ liệu') || name.includes('Thành viên'));
        if (!sheetName) {
          sheetName = workbook.SheetNames.find(name => !name.includes('Hướng dẫn')) || workbook.SheetNames[0];
        }

        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedRows = rawJson.map((row, idx) => {
          const fullName = String(row['Họ và tên'] || row['Họ tên'] || row['FullName'] || row['Full Name'] || '');
          const rawGender = String(row['Giới tính'] || row['Gender'] || '').trim().toLowerCase();
          let gender = 0; // Default Nam
          if (rawGender === 'nữ' || rawGender === 'nu' || rawGender === 'female' || rawGender === '1') gender = 1;
          else if (rawGender === 'khác' || rawGender === 'khac' || rawGender === 'other' || rawGender === '2') gender = 2;

          const rawStatus = String(row['Trạng thái'] || row['Status'] || '').trim().toLowerCase();
          const isAlive = !(rawStatus === 'đã mất' || rawStatus === 'da mat' || rawStatus === 'dead' || rawStatus === 'false');

          const generationLevel = parseInt(row['Thế hệ'] || row['Thế hệ (Đời)'] || row['Generation'] || 1, 10) || 1;
          const birthYear = parseInt(row['Năm sinh'] || row['BirthYear'] || '', 10) || null;
          const deathYear = parseInt(row['Năm mất'] || row['DeathYear'] || '', 10) || null;
          const occupation = String(row['Nghề nghiệp'] || row['Occupation'] || '');
          const currentResidence = String(row['Nơi ở hiện tại'] || row['Nơi ở'] || row['Residence'] || '');
          const bio = String(row['Ghi chú'] || row['Tiểu sử'] || row['Bio'] || '');

          // Validate row
          const errors = [];
          if (!fullName.trim()) errors.push('Thiếu họ và tên');
          if (birthYear && (birthYear < 1000 || birthYear > new Date().getFullYear())) errors.push('Năm sinh không hợp lệ');
          if (deathYear && birthYear && deathYear < birthYear) errors.push('Năm mất nhỏ hơn năm sinh');

          return {
            rowIndex: idx + 2, // Excel 1-indexed row with header
            fullName: fullName.trim(),
            gender,
            isAlive,
            generationLevel,
            birthYear,
            deathYear,
            occupation: occupation.trim(),
            currentResidence: currentResidence.trim(),
            bio: bio.trim(),
            isValid: errors.length === 0,
            errors
          };
        });

        resolve(parsedRows);
      } catch (err) {
        reject(new Error('Lỗi khi đọc file Excel: ' + err.message));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
