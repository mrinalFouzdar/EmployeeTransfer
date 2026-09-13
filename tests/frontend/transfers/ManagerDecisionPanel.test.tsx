import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManagerDecisionPanel } from "../../../src/frontend/modules/transfers/components/ManagerDecisionPanel";
import { transfersApi } from "../../../src/frontend/modules/transfers/services/transfersApi";

vi.mock("../../../src/frontend/modules/transfers/services/transfersApi", () => ({
  transfersApi: { managerDecision: vi.fn() },
}));
vi.mock("../../../src/frontend/shared/hooks/useActor", () => ({
  useActor: () => [{ id: "mgr-1", role: null }, vi.fn()],
}));

describe("ManagerDecisionPanel (T24, AC17)", () => {
  beforeEach(() => {
    vi.mocked(transfersApi.managerDecision).mockReset();
  });

  it("blocks decline without a reason", async () => {
    const onDecided = vi.fn();
    render(<ManagerDecisionPanel requestId="req-1" onDecided={onDecided} />);

    fireEvent.click(screen.getByText("Decline"));

    expect(await screen.findByText(/reason is required/i)).toBeInTheDocument();
    expect(transfersApi.managerDecision).not.toHaveBeenCalled();
  });

  it("confirms without requiring a reason", async () => {
    vi.mocked(transfersApi.managerDecision).mockResolvedValue({ requestId: "req-1", status: "Under HR Review" });
    const onDecided = vi.fn();
    render(<ManagerDecisionPanel requestId="req-1" onDecided={onDecided} />);

    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => expect(transfersApi.managerDecision).toHaveBeenCalledWith(
      { id: "mgr-1", role: null },
      "req-1",
      { managerRole: "current", decision: "confirm", reason: null }
    ));
    expect(onDecided).toHaveBeenCalled();
  });

  it("sends the receiving manager role when selected", async () => {
    vi.mocked(transfersApi.managerDecision).mockResolvedValue({ requestId: "req-1", status: "Under HR Review" });
    render(<ManagerDecisionPanel requestId="req-1" onDecided={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/acting as/i), { target: { value: "receiving" } });
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() =>
      expect(transfersApi.managerDecision).toHaveBeenCalledWith(
        { id: "mgr-1", role: null },
        "req-1",
        expect.objectContaining({ managerRole: "receiving" })
      )
    );
  });
});
