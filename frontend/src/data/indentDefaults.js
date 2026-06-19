export const emptyItem = {
  material_id: '',
  item_name: '',
  quantity: '',
  uom: '',
  unit_price: '',
};

export const emptyForm = {
  item_name: '',
  quantity: '',
  uom: '',
  requested_by: '',
  requested_by_name: '',
  approver_id: '',
  store_id: '',
  dept_code: '',
  dist_code: '',
  purpose: '',
  items: [{ ...emptyItem }],
};
