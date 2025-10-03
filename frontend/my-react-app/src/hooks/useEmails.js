// hooks/useEmails.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useEmails(activeAccountId, autoRefresh = false, refreshInterval = 60000) {
  return useQuery({
    queryKey: ['emails', activeAccountId],
    queryFn: async () => {
      const params = { q: '*' };
      if (activeAccountId) params.account_id = activeAccountId;
      const res = await axios.get("http://localhost:3000/emails/search", { params });
      return res.data.emails || [];
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 5000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: true,
  });
}
