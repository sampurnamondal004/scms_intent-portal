export const emptyItem = {
  material_id: '',
  item_name: '',
  quantity: 1,
  uom: 'Nos',
  unit_price: 0,
};

export const emptyForm = {
  item_name: '',
  quantity: 1,
  uom: 'Nos',
  requested_by: '2301',
  requested_by_name: 'Himanish Saha',
  approver_id: '1001',
  store_id: '11',
  dept_code: '7',
  dist_code: '1',
  purpose: '',
  items: [{ ...emptyItem }],
};

export const demoIndents = [
  {
    indent_id: 101,
    indent_no: 'IND-20260618-001',
    item_name: 'Cement bags',
    quantity: 61,
    uom: 'Nos',
    requested_by: 2301,
    requested_by_name: 'Himanish Saha',
    approver_id: 1001,
    store_id: 11,
    dept_code: 7,
    dist_code: 1,
    purpose: 'Road division store replenishment',
    status: 'PENDING',
    remarks: null,
    created_on: new Date().toISOString(),
  },
  {
    indent_id: 102,
    indent_no: 'IND-20260617-014',
    item_name: 'Safety cones',
    quantity: 26,
    uom: 'Nos',
    requested_by: 2301,
    requested_by_name: 'AMARPUR RD BLOCK STORE',
    approver_id: 1001,
    store_id: 12,
    dept_code: 7,
    dist_code: 1,
    purpose: 'Gate pass and site issue stock',
    status: 'APPROVED',
    remarks: 'Approved',
    created_on: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    indent_id: 103,
    indent_no: 'IND-20260616-033',
    item_name: 'Bitumen drum',
    quantity: 10,
    uom: 'Drum',
    requested_by: 2302,
    requested_by_name: 'BISHALGARH RD BLOCK STORE',
    approver_id: 1001,
    store_id: 13,
    dept_code: 7,
    dist_code: 1,
    purpose: 'Maintenance work',
    status: 'REJECTED',
    remarks: 'Quantity mismatch',
    created_on: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const activeStores = [
  ['AMARPUR RD BLOCK STORE', 61, 26, 25, 51],
  ['AMARPUR RD DIVISIONAL STORE', 700, 492, 510, 72],
  ['AMBASSA RD BLOCK STORE', 55, 10, 10, 22],
  ['AMBASSA RD DIVISIONAL STORE', 912, 344, 384, 95],
  ['BELBARI RD BLOCK STORE', 1, 0, 0, 0],
  ['BHARATCHANDRANAGAR RD BLOCK STORE', 0, 0, 0, 17],
  ['BISHRAMGANJ RD DIVISIONAL STORE', 1156, 830, 844, 88],
  ['BOKAFA RD BLOCK STORE', 30, 0, 0, 32],
  ['BOXANAGAR RD BLOCK STORE', 114, 84, 85, 98],
  ['CHANDIPUR RD BLOCK STORE', 275, 209, 218, 67],
];

export const inactiveStores = [
  'BAMUTIA RD BLOCK STORE',
  'BISHALGARH RD BLOCK STORE',
  'DUKLI RD BLOCK STORE',
  'DUMBURNAGAR RD BLOCK STORE',
  'GANGANAGAR RD BLOCK STORE',
  'HEZAMARA RD BLOCK STORE',
  'LEFUNGA RD BLOCK STORE',
  'MANDWAI RD BLOCK STORE',
  'MOHANPUR RD BLOCK STORE',
];

export const storeRows = [
  ['Dhalai', 'Longtharai Valley', 'Manu', '669503', 'Manu RD Block store', 'BLOCK'],
  ['Dhalai', 'Longtharai Valley', 'Chawmanu', '669202', 'Chawmanu RD Block store', 'BLOCK'],
  ['Dhalai', 'Ambassa', 'Ganganagar', '669703', 'Ganganagar RD Block store', 'BLOCK'],
  ['Dhalai', 'Gonda Twisa', 'Raishyabari', '668602', 'Raishyabari RD Block store', 'BLOCK'],
  ['Dhalai', 'Kamalpur', 'Durgachowmuhani', '668102', 'Durga Chowmuhani', 'BLOCK'],
  ['Dhalai', 'Kamalpur', 'Salema', '668101', 'Salema RD Block store', 'BLOCK'],
  ['Dhalai', 'Gonda Twisa', 'Dumburnagar', '668601', 'Dumburnagar RD Block store', 'BLOCK'],
  ['Dhalai', 'Ambassa', 'Ambassa', '669702', 'Ambassa RD Block store', 'BLOCK'],
  ['Dhalai', 'Longtharai Valley', 'Manu', '669501', 'Manu RD Divisional Store', 'DIVISIONAL'],
  ['Dhalai', 'Ambassa', 'Ambassa', '669701', 'Ambassa RD Divisional Store', 'DIVISIONAL'],
];

export const employeeRows = [
  ['Dhalai', 'Gonda Twisa', 'Ambassa', 'Raishyabari RD Block store', 'Administrator', 'Administrator', '99999'],
  ['Dhalai', 'Ambassa', 'Ambassa', 'Ambassa RD Block store', 'a', 'Executive Engineer', 'BLO_AMB_10'],
  ['Dhalai', 'Ambassa', 'Ambassa', 'Ambassa RD Divisional Store', 'Abhinab Chakma', 'MGNREGA Technical Assistant', 'IO_8974356331'],
  ['Dhalai', 'Kamalpur', 'Durgachowmuhani', 'Durga Chowmuhani', 'Abinash Debnath', 'Panchayat Secretary', 'IO_9562885823'],
  ['Dhalai', 'Amarpur', 'Manu', 'Manu RD Block store', 'Ajoy Halam', 'Rural Programme Manager', 'IO_8837341352'],
  ['Dhalai', 'Kamalpur', 'Durgachowmuhani', 'Durga Chowmuhani', 'Ajoy Sharma', 'MGNREGA Technical Assistant', 'IO_8787374376'],
  ['Dhalai', 'Ambassa', 'Ambassa', 'Ambassa RD Divisional Store', 'Amalendu Debbarma', 'MGNREGA Technical Assistant', 'IO_9402363521'],
  ['Dhalai', 'Ambassa', 'Ambassa', 'Ambassa RD Block store', 'Amarjyoti Tripura', 'Rural Programme Manager', 'IO_8132807833'],
];

export const materialRows = [
  ['Construction', 'BI Pipe', '011060019', 'Black Iron Pipe (25mm NB)', 'IS 1161 : 2014', '', 'mtr', 'NO'],
  ['Construction', 'BI Pipe', '011060018', 'Black Iron Pipe (32mm NB)', 'IS 1161 : 2014', '', 'mtr', 'NO'],
  ['Construction', 'BI Pipe', '011060017', 'Black Iron Pipe (40mm NB)', 'IS 1161 : 2014', '', 'mtr', 'NO'],
  ['Construction', 'BI Pipe', '011060016', 'Black Iron Pipe 50mm NB', 'IS 1161 : 2014', 'ere', 'mtr', 'NO'],
  ['Construction', 'Cement', '011010001', 'Cement(OPC/PPC/Portland Slag)', 'IS: 269 / IS: 1489', '', 'Bag', 'MT'],
  ['Construction', 'Cement', '011010175', 'Form button formation sample', '123', '123', 'MT', 'Bag'],
  ['Construction', 'Cement', '011010173', 'SELECT SLEEP 20', '11', '111111', 'Bag', 'Bag'],
  ['Construction', 'Electric cable', '011100040', '10 sq mm electric cable', 'IS: 694', '', 'mtr', 'NO'],
];

export const vendorRows = [
  ['AMRIT CEMENT', 'SO-2/C/EE/RDSD/2024-25', 'OPPOSITE HORSE SHOE BUILDING,LOWER LACHUMIERE,SHILLONG', '8811034558', 'agmsales2@amrit.co.in', 'AUR-FC/2023/00160', '2024-12-31'],
  ['BALAJI STEEL ROLLING MILLS', 'TMT BAR', 'TIDC PLOT,BODHJUNGNAGAR INDUSTRIAL GROWTH CENTER,AGARTALA', '9436121975', 'agartala2assam@gmail.com', 'CM/L-5400070594', '2024-04-20'],
  ['DALMIA CEMENT', 'CEMENT', 'GUWAHATI-781005', '9862092471', 'sarma.mridul@dalmiacement.co', '12345', '2025-04-30'],
  ['digitalAge', 'test', 'click', '9876543210', 'test123@gmail.com', '1234', '2024-09-02'],
  ['MAX CEMENT', 'MAX CEMENT', 'Guwahati-781005', '9436130890', 'infor@greenvalley.com', '12345', '2025-03-28'],
  ['NEZONE PIPES & STRUCTURES', 'BLACK IRON PIPE', 'GUWAHATI-781005', '7005629944', 'netl@nezonesteel.com', '12342', '2025-04-30'],
  ['STAR CEMENT', 'SO-03/C/EE/RDSD/2024-24', '2ND FLOOR OPP RAJIB BHAWAN,G.S.ROAD,GUWAHATI-781005,ASSAM.', '9435552322', 'abhishekjoshi@starcement.co.in', 'AUR-FC/2023/0067', '2024-12-31'],
];

export const manufacturerRows = [
  ['1_1', '1_1', '1_1', '1_1'],
  ['7*7', '7*7', '7*7', '7*7'],
  ['7*7', '7*7', '7*7', '7*7'],
  ['test', '_script_alert 1_/script_', '_script_alert 1_/script_', '9876543211'],
];
