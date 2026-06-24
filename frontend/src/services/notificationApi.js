const NOTIF_API = 'http://localhost:8001';
const NOTIF_WS  = 'ws://localhost:8001';

export const getNotifications = async (userId) => {
  const res = await fetch(`${NOTIF_API}/api/notifications/${userId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const sendNotification = async ({ user_id, message }) => {
  const res = await fetch(`${NOTIF_API}/api/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, message }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const createWebSocket = (userId, onMessage, onOpen, onClose) => {
  const ws = new WebSocket(`${NOTIF_WS}/ws/${userId}`);
  ws.onopen    = () => { if (onOpen) onOpen(); };
  ws.onclose   = () => { if (onClose) onClose(); };
  ws.onerror   = (e) => console.error('WS error', e);
  ws.onmessage = (e) => {
    try { if (onMessage) onMessage(JSON.parse(e.data)); }
    catch (err) { console.error('WS parse error', err); }
  };
  return ws;
};