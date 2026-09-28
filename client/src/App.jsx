import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Sales from "./pages/Sales/Sales";
import NewSale from "./pages/Sales/NewSale/NewSale";

import Billing from "./pages/Billing/Billing";

import Invoices from "./pages/Invoices/Invoices";
import NewInvoice from "./pages/Invoices/NewInvoice/NewInvoice";

import Returns from "./pages/Returns/Returns";
import NewReturn from "./pages/Returns/NewReturn/NewReturn";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          {/* ================= DEFAULT ================= */}

          <Route
            path="/"
            element={<Navigate to="/sales" replace />}
          />


          {/* ================= SALES ================= */}

          <Route
            path="/sales"
            element={<Sales />}
          />

          <Route
            path="/sales/new"
            element={<NewSale />}
          />


          {/* ================= BILLING ================= */}

          <Route
            path="/billing"
            element={<Billing />}
          />


          {/* ================= INVOICES ================= */}

          <Route
            path="/invoices"
            element={<Invoices />}
          />

          <Route
            path="/invoices/new"
            element={<NewInvoice />}
          />


          {/* ================= RETURNS ================= */}

          <Route
            path="/returns"
            element={<Returns />}
          />

          <Route
            path="/returns/new"
            element={<NewReturn />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;