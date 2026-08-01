const Api = {
  get(action, params) {
    const qs = new URLSearchParams(Object.assign({ action }, params || {})).toString();
    return fetch(`${API_URL}?${qs}`).then((r) => r.json());
  },
  // Content-Type text/plain evita el preflight CORS que Apps Script no puede responder;
  // el body igual se parsea como JSON del lado del servidor.
  post(action, payload) {
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    }).then((r) => r.json());
  }
};
