import api from "../api/api";

export const fetchStats = () => api.get("/admin/analytics/stats");
export const fetchDaily = () => api.get("/admin/analytics/daily");
export const fetchAvgTime = () => api.get("/admin/analytics/avg-time");
