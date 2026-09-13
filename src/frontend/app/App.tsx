import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { MyRequestsListPage } from "../modules/transfers/pages/MyRequestsListPage";
import { RequestFormPage } from "../modules/transfers/pages/RequestFormPage";
import { RequestTrackerPage } from "../modules/transfers/pages/RequestTrackerPage";
import { ApprovalsQueuePage } from "../modules/transfers/pages/ApprovalsQueuePage";
import { HrReviewQueuePage } from "../modules/transfers/pages/HrReviewQueuePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MyRequestsListPage />} />
          <Route path="/new" element={<RequestFormPage />} />
          <Route path="/requests/:id" element={<RequestTrackerPage />} />
          <Route path="/approvals" element={<ApprovalsQueuePage />} />
          <Route path="/hr-review" element={<HrReviewQueuePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
