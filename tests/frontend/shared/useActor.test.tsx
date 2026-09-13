import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act, render } from "@testing-library/react";
import { useActor } from "../../../src/frontend/shared/hooks/useActor";
import { ActorSwitcher } from "../../../src/frontend/shared/components/ActorSwitcher";

describe("useActor (regression: useSyncExternalStore snapshot stability)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns an empty actor when nothing is stored", () => {
    const { result } = renderHook(() => useActor());
    expect(result.current[0]).toEqual({ id: "", role: null });
  });

  it("returns the SAME object reference across re-renders when localStorage hasn't changed", () => {
    // This is the exact contract useSyncExternalStore requires of getSnapshot(). Returning
    // a freshly-parsed object every call (even with identical contents) makes React think
    // the store changed on every render, which loops forever ("Maximum update depth
    // exceeded") - this is the bug that crashed the app on load.
    const { result, rerender } = renderHook(() => useActor());
    const first = result.current[0];
    rerender();
    const second = result.current[0];
    expect(second).toBe(first);
  });

  it("updates state and persists to localStorage when setActor is called", () => {
    const { result } = renderHook(() => useActor());
    act(() => {
      result.current[1]({ id: "emp-1", role: null });
    });
    expect(result.current[0]).toEqual({ id: "emp-1", role: null });
    expect(window.localStorage.getItem("employee-portal:actor")).toBe(JSON.stringify({ id: "emp-1", role: null }));
  });

  it("reflects a change made by a second hook instance (shared store)", () => {
    const a = renderHook(() => useActor());
    const b = renderHook(() => useActor());
    act(() => {
      a.result.current[1]({ id: "mgr-1", role: null });
    });
    expect(b.result.current[0]).toEqual({ id: "mgr-1", role: null });
  });
});

describe("ActorSwitcher with the real useActor hook (regression)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders without throwing 'Maximum update depth exceeded'", () => {
    expect(() => render(<ActorSwitcher />)).not.toThrow();
  });
});
