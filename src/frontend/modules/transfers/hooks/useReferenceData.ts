import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";
import { useActor } from "../../../shared/hooks/useActor";

export interface ReferenceItem {
  id: string;
  name: string;
}

export function useReferenceData() {
  const [actor] = useActor();
  const [departments, setDepartments] = useState<ReferenceItem[]>([]);
  const [locations, setLocations] = useState<ReferenceItem[]>([]);
  const [roles, setRoles] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiClient.get<{ items: ReferenceItem[] }>("/reference-data/departments", actor),
      apiClient.get<{ items: ReferenceItem[] }>("/reference-data/locations", actor),
      apiClient.get<{ items: ReferenceItem[] }>("/reference-data/roles", actor),
    ])
      .then(([d, l, r]) => {
        if (cancelled) return;
        setDepartments(d.items);
        setLocations(l.items);
        setRoles(r.items);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load reference data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor.id]);

  return { departments, locations, roles, loading, error };
}
