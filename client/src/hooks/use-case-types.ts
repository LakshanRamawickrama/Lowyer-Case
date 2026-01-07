import { useQuery } from "@tanstack/react-query";
import type { CaseType } from "@shared/schema";

export function useCaseTypes() {
    return useQuery<CaseType[]>({
        queryKey: ["/api/case-types"],
    });
}
