import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
  FiShoppingCart,
  FiCreditCard,
  FiFileText,
  FiCornerUpLeft,
  FiMenu,
} from "react-icons/fi";

import "./MainLayout.css";

function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = () => {
    if (window.innerWidth <= 700) {
      closeMobileMenu();
    }
  };

  return (
    <div className="app-layout">

      {/* =====================================================
          MOBILE HAMBURGER BUTTON
          Always visible on mobile
          ===================================================== */}

      <button
        type="button"
        className={`mobile-hamburger ${
          isMobileMenuOpen ? "mobile-hamburger-open" : ""
        }`}
        onClick={() =>
          setIsMobileMenuOpen((current) => !current)
        }
        aria-label={
          isMobileMenuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
      >
        <FiMenu />
      </button>


      {/* =====================================================
          MOBILE OVERLAY
          Click outside sidebar to close
          ===================================================== */}

      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`sidebar ${
          isMobileMenuOpen ? "mobile-sidebar-open" : ""
        }`}
      >

        {/* =================================================
            BRAND
            ================================================= */}

        <div className="brand">

          <div className="brand-logo">
            B
          </div>

          <div className="brand-details">
            <h2>BillPro</h2>

            <span>
              Billing System
            </span>
          </div>

        </div>


        {/* =================================================
            SIDEBAR CONTENT
            ================================================= */}

        <div className="sidebar-content">

          <p className="menu-title">
            MAIN MENU
          </p>


          <nav className="navigation">

            {/* SALES */}

            <NavLink
              to="/sales"
              className="nav-item"
              onClick={handleNavigation}
            >
              <span className="nav-icon">
                <FiShoppingCart />
              </span>

              <span className="nav-label">
                Sales
              </span>
            </NavLink>


            {/* BILLING */}

            <NavLink
              to="/billing"
              className="nav-item"
              onClick={handleNavigation}
            >
              <span className="nav-icon">
                <FiCreditCard />
              </span>

              <span className="nav-label">
                Billing
              </span>
            </NavLink>


            {/* INVOICES */}

            <NavLink
              to="/invoices"
              className="nav-item"
              onClick={handleNavigation}
            >
              <span className="nav-icon">
                <FiFileText />
              </span>

              <span className="nav-label">
                Invoices
              </span>
            </NavLink>


            {/* RETURNS */}

            <NavLink
              to="/returns"
              className="nav-item"
              onClick={handleNavigation}
            >
              <span className="nav-icon">
                <FiCornerUpLeft />
              </span>

              <span className="nav-label">
                Returns
              </span>
            </NavLink>

          </nav>

        </div>


        {/* =================================================
            SIDEBAR USER
            ================================================= */}

        <div className="sidebar-user">

          <div className="user-avatar">
            SK
          </div>

          <div className="user-info">

            <strong>
              Admin User
            </strong>

            <span>
              Administrator
            </span>

          </div>

          <button
            className="user-menu"
            type="button"
            aria-label="User menu"
          >
            ⋮
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <div className="main-area">

        {/* =================================================
            TOP HEADER
            ================================================= */}

        <header className="top-header">

          <div className="page-heading">

            <h1>
              Billing Management
            </h1>

            <p>
              Manage your sales, invoices and returns.
            </p>

          </div>


          <div className="header-actions">

            <div className="header-user">

              <div className="header-avatar">
                SK
              </div>

              <div className="header-user-details">

                <strong>
                  Admin User
                </strong>

                <span>
                  Administrator
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
            ================================================= */}

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;