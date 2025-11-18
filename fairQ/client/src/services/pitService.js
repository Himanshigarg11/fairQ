
import api from "../api/api";

export const generatePIT = (ticketId, checklist) => {
  return api.post("/pit/generate", {
    ticketId,
    checklist
  });
};
