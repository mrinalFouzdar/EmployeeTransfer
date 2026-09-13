import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HrDecisionPanel } from "../../../src/frontend/modules/transfers/components/HrDecisionPanel";
import { transfersApi } from "../../../src/frontend/modules/transfers/services/transfersApi";

vi.mock("../../../src/frontend/modules/transfers/services/transfersApi", () => ({
  transfersApi: { hrDecision: vi.fn() },
}));
vi.mock("../../../src/frontend/shared/hooks/useActor", () => ({
  useActor: () => [{ id: "hr-1", role: "HR" }, vi.fn()],
}));

describe("HrDecisionPanel (T24, AC22)", () => {
  beforeEach(() => {
    vi.mocked(transfersApi.hrDecision).mockReset();
  });

  it("blocks not_eligible without a reason", async () => {
    render(<HrDecisionPanel requestId="req-1" onDecided={vi.fn()} />);
    fireEvent.click(screen.getByText("Not eligible"));
    expect(await screen.findByText(/reason is required/i)).toBeInTheDocument();
    expect(transfersApi.hrDecision).not.toHaveBeenCalled();
  });

  it("submits an eligible decision", async () => {
    vi.mocked(transfersApi.hrDecision).mockResolvedValue({ requestId: "req-1", status: "Approved - In Progress" });
    const onDecided = vi.fn();
    render(<HrDecisionPanel requestId="req-1" onDecided={onDecided} />);
    fireEvent.click(screen.getByText("Eligible"));
    await waitFor(() =>
      expect(transfersApi.hrDecision).toHaveBeenCalledWith({ id: "hr-1", role: "HR" }, "req-1", { decision: "eligible", reason: null })
    );
    expect(onDecided).toHaveBeenCalled();
  });
});
