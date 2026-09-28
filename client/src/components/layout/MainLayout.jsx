import { NavLink, Outlet } from "react-router-dom";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="app-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">B</div>

          <div>
            <h2>BillPro</h2>
            <span>Billing System</span>
          </div>
        </div>

        <div className="sidebar-content">

          <p className="menu-title">MAIN MENU</p>

          <nav className="navigation">

            <NavLink to="/sales" className="nav-item">
              <span className="nav-icon">▤</span>
              <span>Sales</span>
            </NavLink>

            <NavLink to="/billing" className="nav-item">
              <span className="nav-icon">▣</span>
              <span>Billing</span>
            </NavLink>

            <NavLink to="/invoices" className="nav-item">
              <span className="nav-icon">▤</span>
              <span>Invoices</span>
            </NavLink>

            <NavLink to="/returns" className="nav-item">
              <span className="nav-icon">↩</span>
              <span>Returns</span>
            </NavLink>

          </nav>

          <p className="menu-title management-title">
            MANAGEMENT
          </p>

          <nav className="navigation">

            <div className="nav-item disabled">
              <span className="nav-icon">○</span>
              <span>Customers</span>
            </div>

            <div className="nav-item disabled">
              <span className="nav-icon">□</span>
              <span>Products</span>
            </div>

            <div className="nav-item disabled">
              <span className="nav-icon">▥</span>
              <span>Inventory</span>
            </div>

          </nav>

          <p className="menu-title others-title">
            OTHERS
          </p>

          <nav className="navigation">

            <div className="nav-item disabled">
              <span className="nav-icon">○</span>
              <span>Payments</span>
            </div>

          </nav>

        </div>

        {/* User */}
        <div className="sidebar-user">

          <div className="user-avatar">
            SK
          </div>

          <div className="user-info">
            <strong>Admin User</strong>
            <span>Administrator</span>
          </div>

          <button className="user-menu">
            ⋮
          </button>

        </div>

      </aside>

      {/* Main Area */}
      <div className="main-area">

        {/* Header */}
        <header className="top-header">

          <div className="page-heading">
            <h1>Billing Management</h1>
            <p>
              Manage your sales, invoices and returns.
            </p>
          </div>

          <div className="header-actions">

            <button className="notification-button">
              ♧
            </button>

            <div className="header-user">

              <div className="header-avatar">
                SK
              </div>

              <div>
                <strong>Admin User</strong>
                <span>Administrator</span>
              </div>

              <span className="dropdown-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;