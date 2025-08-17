import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' })
// Use a demo token for quick start
api.interceptors.request.use(cfg => { cfg.headers = cfg.headers || {}; (cfg.headers as any).Authorization = 'Bearer demo'; return cfg })
export default api