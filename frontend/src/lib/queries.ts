import { useQuery } from "@tanstack/react-query";
import { api, toListItem } from "./api";
import { useMode } from "./mode";
import { demoComparison, demoInvestigations, loadDemoDrafts } from "@/data/demoData";

const allDemo = () => [...loadDemoDrafts(), ...demoInvestigations];

export function useInvestigations() {
  const mode = useMode();
  return useQuery({
    queryKey: ["investigations", mode],
    queryFn: async () => (mode === "demo" ? allDemo().map(toListItem) : api.listInvestigations()),
    retry: false,
  });
}

export function useInvestigation(id: string) {
  const mode = useMode();
  return useQuery({
    queryKey: ["investigation", mode, id],
    queryFn: async () => {
      if (mode === "demo") {
        const found = allDemo().find((i) => i.id === id);
        if (!found) throw new Error("This sample investigation does not exist.");
        return found;
      }
      return api.getInvestigation(id);
    },
    retry: false,
  });
}

export function useComparison(ids: string[]) {
  const mode = useMode();
  return useQuery({
    queryKey: ["compare", mode, ids],
    queryFn: async () => (mode === "demo" ? demoComparison(ids) : api.compare(ids)),
    enabled: ids.length >= 2,
    retry: false,
  });
}

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: () => api.health(), retry: false });
}
