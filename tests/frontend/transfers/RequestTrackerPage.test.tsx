import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RequestTrackerPage } from "../../../src/frontend/modules/transfers/pages/RequestTrackerPage";
import { transfersApi, TransferRequestView } from "../../../src/frontend/modules/transfers/services/transfersApi";

vi.mock("../../../src/frontend/modules/transfers/services/transfersApi", () => ({
  transfersApi: { get: vi.fn(), withdraw: vi.fn(), managerDecision: vi.fn(), hrDecision: vi.fn() },
}));
vi.mock("../../../src/frontend/shared/hooks/useActor", () => ({
  useActor: () => [{ id: "emp-1", role: null }, vi.fn()],
}));

function renderAt(requestId: string) {
  return render(
    <MemoryRouter initialEntries={[`/requests/${requestId}`]}>
      <Routes>
        <Route path="/requests/:id" element={<RequestTrackerPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const baseView: TransferRequestView = {
  requestId: "req-1",
  status: "Submitted",
  current: { departmentId: "d1", locationId: "l1", roleId: "r1" },
  proposed: { departmentId: "d2", locationId: "l2", roleId: "r2" },
  effectiveDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  reason: null,
  pendingAction: { stakeholder: "Current Manager", pendingSince: new Date().toISOString() },
  history: [],
};

describe("RequestTrackerPage (T23, AC13-AC14)", () => {
  beforeEach(() => {
    vi.mocked(transfersApi.get).mockReset();
  });

  it("AC13/AC14: shows status and the pending stakeholder", async () => {
    vi.mocked(transfersApi.get).mockResolvedValue(baseView);
    renderAt("req-1");

    expect(await screen.findByText(/Submitted/)).toBeInTheDocument();
    expect(screen.getByText(/Current Manager/)).toBeInTheDocument();
  });

  it("shows the withdraw button only for withdrawable statuses", async () => {
    vi.mocked(transfersApi.get).mockResolvedValue(baseView);
    renderAt("req-1");
    await waitFor(() => expect(screen.getByText(/Withdraw request/)).toBeInTheDocument());
  });

  it("hides the withdraw button for a terminal status", async () => {
    vi.mocked(transfersApi.get).mockResolvedValue({ ...baseView, status: "Completed", pendingAction: { stakeholder: null, pendingSince: null } });
    renderAt("req-1");
    await waitFor(() => expect(screen.getByText(/Completed/)).toBeInTheDocument());
    expect(screen.queryByText(/Withdraw request/)).not.toBeInTheDocument();
  });

  it("shows the manager decision panel only while Submitted", async () => {
    vi.mocked(transfersApi.get).mockResolvedValue(baseView);
    renderAt("req-1");
    await waitFor(() => expect(screen.getByText(/Manager decision/)).toBeInTheDocument());
  });

  it("shows the HR decision panel only while Under HR Review", async () => {
    vi.mocked(transfersApi.get).mockResolvedValue({ ...baseView, status: "Under HR Review", pendingAction: { stakeholder: "HR", pendingSince: new Date().toISOString() } });
    renderAt("req-1");
    await waitFor(() => expect(screen.getByText(/HR eligibility decision/)).toBeInTheDocument());
    expect(screen.queryByText(/^Manager decision$/)).not.toBeInTheDocument();
  });
});
