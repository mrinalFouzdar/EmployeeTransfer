import { useEffect, useState } from "react";
import { apiClient, ApiClientError } from "../../../shared/services/apiClient";
import { useActor, Actor } from "../../../shared/hooks/useActor";

function describeError(err: unknown, actor: Actor): string {
  if (err instanceof ApiClientError && err.status === 404) {
    return `No employee profile found for actor id "${actor.id}". Check the id matches a seeded EmployeeProfileSeed row exactly.`;
  }
  return err instanceof Error ? err.message : "Failed to load your profile";
}

export interface MyProfile {
  employeeId: string;
  currentDepartmentId: string;
  currentLocationId: string;
  currentRoleId: string;
}

export function useMyProfile() {
  const [actor] = useActor();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actor.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiClient
      .get<MyProfile>("/transfers/my-profile", actor)
      .then((p) => {
        if (!cancelled) {
          setProfile(p);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(describeError(err, actor));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor.id]);

  return { profile, loading, error };
}
