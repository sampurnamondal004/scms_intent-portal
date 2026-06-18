function normalizeNumber(value) {
  return value === '' ? undefined : Number(value);
}

export function pruneIndentPayload(form) {
  return {
    item_name: form.item_name.trim(),
    quantity: Number(form.quantity),
    uom: form.uom || null,
    requested_by: Number(form.requested_by),
    requested_by_name: form.requested_by_name || null,
    approver_id: normalizeNumber(form.approver_id),
    store_id: normalizeNumber(form.store_id),
    dept_code: normalizeNumber(form.dept_code),
    dist_code: normalizeNumber(form.dist_code),
    purpose: form.purpose || null,
    items: form.items
      .filter((item) => item.item_name.trim())
      .map((item) => ({
        material_id: normalizeNumber(item.material_id),
        item_name: item.item_name.trim(),
        quantity: Number(item.quantity),
        uom: item.uom || null,
        unit_price: Number(item.unit_price || 0),
      })),
  };
}
