import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RequestFormPage } from "../../../src/frontend/modules/transfers/pages/RequestFormPage";
import { transfersApi } from "../../../src/frontend/modules/transfers/services/transfersApi";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../../src/frontend/modules/transfers/services/transfersApi", () => ({
  transfersApi: { create: vi.fn() },
}));
vi.mock("../../../src/frontend/shared/hooks/useActor", () => ({
  useActor: () => [{ id: "emp-1", role: null }, vi.fn()],
}));
vi.mock("../../../src/frontend/modules/transfers/hooks/useReferenceData", () => ({
  useReferenceData: () => ({
    departments: [
      { id: "dept-a", name: "Engineering" },
      { id: "dept-b", name: "Sales" },
    ],
    locations: [
      { id: "loc-a", name: "London" },
      { id: "loc-b", name: "Manchester" },
    ],
    roles: [
      { id: "role-a", name: "Engineer" },
      { id: "role-b", name: "Senior Engineer" },
    ],
    loading: false,
    error: null,
  }),
}));
vi.mock("../../../src/frontend/modules/transfers/hooks/useMyProfile", () => ({
  useMyProfile: () => ({
    profile: { employeeId: "emp-1", currentDepartmentId: "dept-a", currentLocationId: "loc-a", currentRoleId: "role-a" },
    loading: false,
    error: null,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <RequestFormPage />
    </MemoryRouter>
  );
}

describe("RequestFormPage (T22, AC1-AC12)", () => {
  beforeEach(() => {
    vi.mocked(transfersApi.create).mockReset();
    navigateMock.mockReset();
  });

  it("AC12: pre-populates current department/location/role as read-only", () => {
    renderPage();
    expect(screen.getByText(/Department: Engineering/)).toBeInTheDocument();
    expect(screen.getByText(/Location: London/)).toBeInTheDocument();
    expect(screen.getByText(/Role: Engineer/)).toBeInTheDocument();
  });

  it("AC6: blocks submission with mandatory fields missing", async () => {
    renderPage();
    fireEvent.click(screen.getByText("Submit request"));
    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
    expect(transfersApi.create).not.toHaveBeenCalled();
  });

  it("AC7: blocks submission with no actual change from current values", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/proposed department/i), { target: { value: "dept-a" } });
    fireEvent.change(screen.getByLabelText(/proposed location/i), { target: { value: "loc-a" } });
    fireEvent.change(screen.getByLabelText(/proposed role/i), { target: { value: "role-a" } });
    fireEvent.change(screen.getByLabelText(/effective date/i), {
      target: { value: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
    });
    fireEvent.click(screen.getByText("Submit request"));
    expect(await screen.findByText(/must differ/i)).toBeInTheDocument();
    expect(transfersApi.create).not.toHaveBeenCalled();
  });

  it("submits a valid request and navigates to the tracker page", async () => {
    vi.mocked(transfersApi.create).mockResolvedValue({ requestId: "req-123", status: "Submitted", submittedAt: new Date().toISOString() });
    renderPage();
    fireEvent.change(screen.getByLabelText(/proposed department/i), { target: { value: "dept-b" } });
    fireEvent.change(screen.getByLabelText(/proposed location/i), { target: { value: "loc-b" } });
    fireEvent.change(screen.getByLabelText(/proposed role/i), { target: { value: "role-b" } });
    fireEvent.change(screen.getByLabelText(/effective date/i), {
      target: { value: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
    });
    fireEvent.click(screen.getByText("Submit request"));

    await waitFor(() => expect(transfersApi.create).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith("/requests/req-123");
  });
});
