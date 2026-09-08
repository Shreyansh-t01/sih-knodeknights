import { useState, useEffect } from "react";

export default function MMVYPortal() {
  const [menuActive, setMenuActive] = useState(false);
  const [modalHidden, setModalHidden] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [dateOnly, setDateOnly] = useState("07/09/2026");
  const [currentDate, setCurrentDate] = useState("07/09/2026 00:00:00");
  const [fontSize, setFontSize] = useState(null);

  const pad2 = (num) => num.toString().padStart(2, "0");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const d = pad2(now.getDate()) + "/" + pad2(now.getMonth() + 1) + "/" + now.getFullYear();
      const t = pad2(now.getHours()) + ":" + pad2(now.getMinutes()) + ":" + pad2(now.getSeconds());
      setCurrentDate(d + " " + t);
      setDateOnly(d);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const closeModal = () => setModalHidden(true);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const setFontSizeHandler = (size) => {
    if (size === "small") setFontSize("12px");
    else if (size === "normal") setFontSize("14px");
    else if (size === "large") setFontSize("16px");
  };

  const handleRedirect = (title, targetUrl) => {
    alert("Redirecting to: " + title);
    if (targetUrl && !targetUrl.startsWith("#")) {
      window.open(targetUrl, "_blank");
    }
  };

  const filterCategory = (categoryName) => {
    alert("Filtering applications for: " + categoryName);
  };

  const toggleMenu = () => {
    setMenuActive((prev) => !prev);
  };

  const toggleSubMenu = (event, key) => {
    if (window.innerWidth <= 900) {
      event.preventDefault();
      setOpenSubMenu((prev) => (prev === key ? null : key));
      return false;
    }
    event.preventDefault();
    return false;
  };

  return (
    <div style={fontSize ? { fontSize } : undefined}>
      <style>{`
        /* --- RESET & BASIC STYLES --- */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Arial, sans-serif;
        }

        body {
            background-color: #f4f6f9;
            color: #333;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        /* --- TOP HEADER BAR --- */
        .top-bar {
            background: linear-gradient(to right, #1c2b3a 0%, #1c2b3a 22%, #163d24 45%, #14532d 65%, #14532d 100%);
            color: #ffffff;
            padding: 6px 15px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }

        .top-bar-left, .top-bar-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .top-bar-left span, .top-bar-right a, .top-bar-right span {
            white-space: nowrap;
        }

        .top-bar a:hover {
            text-decoration: underline;
        }

        .accessibility-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 1px 5px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 11px;
        }

        /* --- MAIN HEADER --- */
        .main-header {
            background-color: #ffffff;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo-text {
            font-size: 18px;
            font-weight: bold;
            color: #8b0000;
        }

        .hamburger-menu {
            font-size: 24px;
            color: #333;
            cursor: pointer;
            border: 1px solid #ccc;
            padding: 4px 10px;
            border-radius: 4px;
            display: none;
        }

        /* --- MAIN NAVIGATION MENU --- */
        .main-nav {
            display: flex;
            align-items: center;
            flex: 1;
            flex-wrap: wrap;
            gap: 6px 18px;
            margin-left: 25px;
            font-size: 14px;
            font-weight: 600;
        }

        .nav-item {
            position: relative;
        }

        .nav-item > a {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #333;
            padding: 8px 2px;
            cursor: pointer;
            white-space: nowrap;
        }

        .nav-item > a:hover {
            color: #2e7d32;
        }

        .nav-item .dropdown-content {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background: #ffffff;
            min-width: 210px;
            box-shadow: 0 6px 14px rgba(0,0,0,0.15);
            border-radius: 4px;
            overflow: hidden;
            z-index: 60;
        }

        .nav-item.dropdown:hover .dropdown-content {
            display: block;
        }

        .dropdown-content a {
            display: block;
            padding: 10px 14px;
            color: #333;
            font-size: 13px;
            font-weight: 500;
            white-space: normal;
        }

        .dropdown-content a:hover {
            background: #f0f4f0;
            color: #2e7d32;
        }

        .faq-btn {
            background-color: #8bc34a;
            color: #1b5e20 !important;
            padding: 8px 18px !important;
            border-radius: 6px;
        }

        .faq-btn:hover {
            background-color: #7cb342;
            color: #1b5e20 !important;
        }

        .btn-mmjky {
            background-color: #d9534f;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 13px;
            margin-left: auto;
            white-space: nowrap;
            cursor: pointer;
        }

        .btn-mmjky:hover {
            background-color: #c9302c;
            text-decoration: none;
        }

        /* --- HERO BANNER SECTION ---
           The bg image is a fixed 1916x830 banner (ratio ~2.308:1).
           Locking the section to that exact aspect-ratio means
           background-size:cover can NEVER crop it — the box is
           always the same shape as the image, at any screen width.
           Text is layered on top with an absolutely-positioned
           overlay so it never forces the box taller than the image
           (which is what used to cause cropping on phones). */
        .hero-section {
            position: relative;
            width: 100%;
            aspect-ratio: 1916 / 830;
            background-image: linear-gradient(rgba(20, 30, 20, 0.35), rgba(20, 30, 20, 0.45)),
                        url('https://plain-apac-prod-public.komododecks.com/202609/07/TuMdchcF2rXCEo1wodnl/image.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
        }

        .hero-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            /* color: white; */
            text-align: center;
            padding: 1% 4%;
        }

        .hero-title {
            background-color: rgba(217, 83, 79, 0.85);
            padding: clamp(3px, 1vw, 8px) clamp(8px, 2.5vw, 25px);
            font-size: clamp(10px, 2.6vw, 26px);
            font-weight: bold;
            border-radius: 4px;
            margin-bottom: clamp(3px, 1.5vw, 15px);
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            color: #D77908;
            max-width: 100%;
        }

        .hero-subtitle {
            font-size: clamp(8px, 1.8vw, 22px);
            font-weight: bold;
            margin-bottom: clamp(2px, 1vw, 10px);
            max-width: 100%;
            color: white;
        }

        .hero-link {
            color: #175584;
            text-decoration:solid;
            font-size: clamp(20px, 1.4vw, 16px);
            cursor: pointer;
        }

        /* --- MAIN CONTAINER --- */
        .main-container {
            width: 100%;
            max-width: 1000px;
            margin: 25px auto 40px auto;
            position: relative;
            z-index: 10;
            padding: 0 15px;
        }

        .portal-title {
            text-align: center;
            font-size: 28px;
            color: #2e7d32;
            margin-bottom: 20px;
            font-weight: bold;
            background: #fff;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .content-card {
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 100%;
            overflow-x: hidden;
        }

        /* --- BUTTONS & BANNERS --- */
        .btn-green-banner {
            background-color: #5cb85c;
            color: white;
            width: 100%;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            font-weight: bold;
            text-align: left;
            font-size: 14px;
            cursor: pointer;
            margin-bottom: 12px;
            display: block;
            transition: background 0.2s;
        }

        .btn-green-banner:hover {
            background-color: #4cae4c;
        }

        /* Category Filter Buttons */
        .category-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 25px;
        }

        .btn-category {
            background-color: #3b7080;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 15px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
        }

        .btn-category:hover {
            background-color: #2c5360;
            transform: translateY(-1px);
        }

        /* Instruction Section */
        .instructions-box {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 25px;
        }

        .instruction-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-top: 10px;
            font-size: 13px;
            color: #444;
            line-height: 1.5;
        }

        .speaker-icon {
            background-color: #5cb85c;
            color: white;
            padding: 6px;
            border-radius: 4px;
            font-size: 12px;
            flex-shrink: 0;
        }

        /* Navigation Grid */
        .nav-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 15px;
        }

        .nav-card-btn {
            background-color: #f8f9fa;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            padding: 12px 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
        }

        .nav-card-btn:hover {
            background-color: #edf2f7;
            border-color: #cbd5e0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .nav-card-icon {
            background-color: #5cb85c;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
        }

        .nav-card-text {
            font-weight: bold;
            color: #2d3748;
            font-size: 13px;
            text-transform: uppercase;
        }

        /* --- MODAL POPUP --- */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.3s ease;
        }

        .modal-overlay.hidden {
            display: none;
            opacity: 0;
            pointer-events: none;
        }

        .modal-container {
            background: #ffffff;
            width: 90%;
            max-width: 600px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            animation: modalSlide 0.3s ease-out;
        }

        @keyframes modalSlide {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
            background-color: #31708f;
            color: white;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 16px;
        }

        .modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }

        .modal-body {
            padding: 20px;
            max-height: 70vh;
            overflow-y: auto;
            font-size: 13px;
            line-height: 1.6;
            color: #333;
        }

        .modal-list-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
        }

        .modal-list-item i {
            color: #31708f;
            margin-top: 3px;
        }

        .highlight-red {
            color: #d9534f;
            font-weight: bold;
        }

        /* --- FOOTER --- */
        .footer {
            background-color: #325C38;
            color: #FF0000;
            text-align: center;
            padding: 15px;
            font-size: 11px;
            line-height: 1.6;
        }

        /* --- FAB CHAT ICON --- */
        .fab-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #1a237e;
            color: white;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 900;
        }

        /* --- TABLET --- */
        @media (max-width: 900px) {
            .main-container {
                max-width: 90%;
            }
            .nav-grid {
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            }

            .hamburger-menu {
                display: block;
            }

            .main-nav {
                display: none;
                flex-direction: column;
                align-items: flex-start;
                width: 100%;
                margin-left: 0;
                margin-top: 12px;
                gap: 2px;
            }

            .main-nav.active {
                display: flex;
            }

            .nav-item {
                width: 100%;
            }

            .nav-item .dropdown-content {
                display: none;
                position: static;
                box-shadow: none;
                width: 100%;
                padding-left: 15px;
            }

            .nav-item.dropdown.open .dropdown-content {
                display: block;
            }

            .btn-mmjky {
                margin-left: 0;
                margin-top: 8px;
                width: 100%;
                text-align: center;
            }
        }

        /* --- MOBILE --- */
        @media (max-width: 600px) {
            .top-bar {
                justify-content: center;
                text-align: center;
                font-size: 10px;
                padding: 8px 10px;
            }

            .top-bar-left, .top-bar-right {
                justify-content: center;
                width: 100%;
                gap: 6px 10px;
            }

            .top-bar-left span, .top-bar-right a, .top-bar-right span {
                white-space: normal;
            }

            .main-header {
                padding: 10px 12px;
                flex-wrap: wrap;
                gap: 8px;
            }

            .logo-text {
                font-size: 14px;
            }

            .hamburger-menu {
                font-size: 18px;
                padding: 3px 8px;
            }

            .main-container {
                max-width: 100%;
                margin: 16px auto 25px auto;
                padding: 0 10px;
            }

            .portal-title {
                font-size: 18px;
                padding: 8px;
            }

            .content-card {
                padding: 14px;
            }

            .btn-green-banner {
                font-size: 12px;
                padding: 10px 12px;
            }

            .category-grid {
                justify-content: center;
                gap: 8px;
            }

            .btn-category {
                font-size: 11px;
                padding: 7px 12px;
            }

            .instructions-box {
                padding: 10px;
            }

            .instruction-item {
                font-size: 12px;
                gap: 8px;
            }

            .nav-grid {
                grid-template-columns: 1fr;
            }

            .nav-card-text {
                font-size: 12px;
            }

            .modal-container {
                width: 95%;
            }

            .modal-header {
                font-size: 14px;
                padding: 10px 14px;
            }

            .modal-body {
                font-size: 12px;
                padding: 14px;
            }

            .fab-btn {
                width: 42px;
                height: 42px;
                font-size: 17px;
                bottom: 14px;
                right: 14px;
            }

            .footer {
                font-size: 10px;
                padding: 12px;
            }
        }

        /* --- SMALL PHONES --- */
        @media (max-width: 380px) {
            .portal-title {
                font-size: 16px;
            }
            .nav-card-text {
                font-size: 11px;
            }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span>Date : <span id="current-date">{currentDate}</span></span>
          <span>Help Desk: <i className="fa-solid fa-phone"></i> 0755-2660063</span>
          <span><i className="fa-solid fa-envelope"></i> mmvyhelpline[dot]dte[at]mp[dot]gov[dot]in</span>
        </div>
        <div className="top-bar-right">
          <a href="#main-content"><i className="fa-solid fa-bars-staggered"></i> Skip to main content</a> |
          <a href="#"><i className="fa-solid fa-desktop"></i> Screen Reader Access</a> |
          <a href="#"><i className="fa-solid fa-sitemap"></i> Sitemap</a> |
          <a href="#"><i className="fa-solid fa-house"></i> Home</a> |
          <span>
            <button className="accessibility-btn" onClick={() => setFontSizeHandler("small")}>A-</button>
            <button className="accessibility-btn" onClick={() => setFontSizeHandler("normal")}>A</button>
            <button className="accessibility-btn" onClick={() => setFontSizeHandler("large")}>A+</button>
          </span>
          <a href="#" style={{ fontWeight: "bold" }}>Hindi</a>
        </div>
      </div>

      {/* MAIN HEADER LOGO & MENU */}
      <header className="main-header">
        <div className="logo-container">
          <img
            src="https://www.medhavikalyan.mp.gov.in/MedhaviChhatra/Medhavi_New/images/logo/logo.svg"
            alt="Medhavi Kalyan Logo"
            style={{ height: "55px", width: "auto" }}
          />
        </div>

        <nav className={`main-nav${menuActive ? " active" : ""}`} id="mainNav">
          <div className={`nav-item dropdown${openSubMenu === "home" ? " open" : ""}`}>
            <a href="#" onClick={(e) => toggleSubMenu(e, "home")}><i className="fa-solid fa-house"></i> Home <i className="fa-solid fa-caret-down"></i></a>
            <div className="dropdown-content">
              <a href="#" onClick={() => handleRedirect("Home", "#main-content")}>Home</a>
              <a href="#" onClick={() => handleRedirect("About MMVY", "#main-content")}>About MMVY</a>
            </div>
          </div>

          <div className="nav-item">
            <a href="#" onClick={() => handleRedirect("Login", "https://mptasc.mp.gov.in/login")}><i className="fa-solid fa-right-to-bracket"></i> Login</a>
          </div>

          <div className={`nav-item dropdown${openSubMenu === "scheme" ? " open" : ""}`}>
            <a href="#" onClick={(e) => toggleSubMenu(e, "scheme")}><i className="fa-solid fa-cube"></i> Scheme <i className="fa-solid fa-caret-down"></i></a>
            <div className="dropdown-content">
              <a href="#" onClick={() => handleRedirect("Scheme Details", "#main-content")}>Scheme Details</a>
              <a href="#" onClick={() => handleRedirect("Eligibility", "#main-content")}>Eligibility</a>
            </div>
          </div>

          <div className="nav-item">
            <a href="#" className="faq-btn" onClick={() => handleRedirect("FAQ", "#main-content")}><i className="fa-solid fa-circle-question"></i> FAQ</a>
          </div>

          <div className={`nav-item dropdown${openSubMenu === "institutes" ? " open" : ""}`}>
            <a href="#" onClick={(e) => toggleSubMenu(e, "institutes")}><i className="fa-solid fa-building-columns"></i> Institutes and their Codes <i className="fa-solid fa-caret-down"></i></a>
            <div className="dropdown-content">
              <a href="#" onClick={() => handleRedirect("Institute List", "#institutes")}>Institute List</a>
              <a href="#" onClick={() => handleRedirect("Institute Codes", "#institutes")}>Institute Codes</a>
            </div>
          </div>

          <div className={`nav-item dropdown${openSubMenu === "courses" ? " open" : ""}`}>
            <a href="#" onClick={(e) => toggleSubMenu(e, "courses")}><i className="fa-solid fa-book"></i> Courses <i className="fa-solid fa-caret-down"></i></a>
            <div className="dropdown-content">
              <a href="#" onClick={() => handleRedirect("Course List", "#courses")}>Course List</a>
            </div>
          </div>

          <div className={`nav-item dropdown${openSubMenu === "application" ? " open" : ""}`}>
            <a href="#" onClick={(e) => toggleSubMenu(e, "application")}><i className="fa-solid fa-list"></i> Application for MMVY ONLY <i className="fa-solid fa-caret-down"></i></a>
            <div className="dropdown-content">
              <a href="#" onClick={() => handleRedirect("New Application", "#main-content")}>New Application</a>
              <a href="#" onClick={() => handleRedirect("Renewal Application", "#main-content")}>Renewal Application</a>
            </div>
          </div>

          <div className="nav-item">
            <a href="#" onClick={() => handleRedirect("Scheme Documents", "#main-content")}><i className="fa-solid fa-print"></i> Scheme Documents</a>
          </div>

          <a href="#" className="btn-mmjky" onClick={() => handleRedirect("MMJKY Portal", "https://mmjky.mp.gov.in")}>Go to MMJKY PORTAL</a>
        </nav>

        <div className="hamburger-menu" onClick={toggleMenu} title="Toggle Menu">
          <i className="fa-solid fa-bars"></i>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-title">मुख्यमंत्री मेधावी विद्यार्थी योजना पोर्टल</div>
          <div className="hero-subtitle">मध्य प्रदेश सरकार का सभी वर्ग के मेधावी विद्यार्थिओं की सहायतार्थ एक समग्र प्रयास</div>
          <div className="hero-link" onClick={() => handleRedirect("About Scheme", "https://mptasc.mp.gov.in")}>योजना के बारे में और अधिक जानें</div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="main-container" id="main-content">
        <div className="portal-title">Welcome to MMVY Portal</div>

        <div className="content-card">
          {/* GREEN DASHBOARD BUTTON */}
          <button className="btn-green-banner" onClick={() => handleRedirect("Dashboard", "https://mptasc.mp.gov.in/dashboard")}>
            DASHBOARD - <span className="current-date-text">{dateOnly}</span>
          </button>

          {/* VIEW APPLICATIONS BUTTON */}
          <button className="btn-green-banner" onClick={() => handleRedirect("View Applications", "https://mptasc.mp.gov.in/applications")}>
            View Applications by Institute Type <span className="current-date-text">{dateOnly}</span>
          </button>

          {/* CATEGORY FILTER BUTTONS */}
          <div className="category-grid">
            <button className="btn-category" onClick={() => filterCategory("Medical Colleges")}>Medical Colleges</button>
            <button className="btn-category" onClick={() => filterCategory("IIT Institutes")}>IIT Institutes</button>
            <button className="btn-category" onClick={() => filterCategory("NIT Institutes")}>NIT Institutes</button>
            <button className="btn-category" onClick={() => filterCategory("IIM Institutes")}>IIM Institutes</button>
            <button className="btn-category" onClick={() => filterCategory("CLAT(NLIU) Institutes")}>CLAT(NLIU) Institutes</button>
            <button className="btn-category" onClick={() => filterCategory("Higher Education Institutes")}>Higher Education Institutes</button>
            <button className="btn-category" onClick={() => filterCategory("Technical Education Institutes")}>Technical Education Institutes</button>
            <button className="btn-category" onClick={() => filterCategory("Others")}>Others</button>
          </div>

          {/* INSTRUCTIONS BOX */}
          <div className="instructions-box">
            <button className="btn-green-banner" style={{ marginBottom: "5px", cursor: "default" }}>
              Instructions for Paper-less Process for sanction &amp; e-Payment of MMVY Applications
            </button>

            <div className="instruction-item">
              <span className="speaker-icon"><i className="fa-solid fa-bullhorn"></i></span>
              <div>MMVY योजना का क्रियान्वयन सरल एवं पेपर-लेस प्रक्रिया के अनुसार सुनिश्चित करने हेतु संस्थाओं को छात्रों के प्रपोजल की स्कैन कॉपी को पोर्टल पर अपलोड करने की बाध्यता को समाप्त कर दिया गया है।</div>
            </div>

            <div className="instruction-item">
              <span className="speaker-icon"><i className="fa-solid fa-bullhorn"></i></span>
              <div>MMVY योजना का क्रियान्वयन सरल एवं पेपर-लेस प्रक्रिया के अनुसार सुनिश्चित करने हेतु Sanctioning Authorities को छात्रों के छात्रवृत्ति स्वीकृति आदेश / sanction order की स्कैन कॉपी को पोर्टल पर अपलोड करने की बाध्यता को समाप्त कर दिया गया है।</div>
            </div>

            <div className="instruction-item">
              <span className="speaker-icon"><i className="fa-solid fa-bullhorn"></i></span>
              <div>Facility to report the recovery of MMVY benefit and permit the applicant to apply for some other scheme has been provided to Sanctioning / Recovery Authority.</div>
            </div>
          </div>

          {/* NAVIGATION BUTTONS GRID */}
          <div className="nav-grid">
            <button className="nav-card-btn" onClick={() => handleRedirect("Institutes Module", "#institutes")}>
              <div className="nav-card-icon"><i className="fa-solid fa-building-columns"></i></div>
              <div className="nav-card-text">Institutes</div>
            </button>

            <button className="nav-card-btn" onClick={() => handleRedirect("Out of State Guidelines", "#out-of-state")}>
              <div className="nav-card-icon"><i className="fa-solid fa-file-lines"></i></div>
              <div className="nav-card-text">Guidelines of Out of State Students / Institutes</div>
            </button>

            <button className="nav-card-btn" onClick={() => handleRedirect("Courses Module", "#courses")}>
              <div className="nav-card-icon"><i className="fa-solid fa-book"></i></div>
              <div className="nav-card-text">Courses</div>
            </button>

            <button className="nav-card-btn" onClick={() => handleRedirect("Students Portal", "#students")}>
              <div className="nav-card-icon"><i className="fa-solid fa-user-graduate"></i></div>
              <div className="nav-card-text">Students</div>
            </button>

            <button className="nav-card-btn" onClick={() => handleRedirect("Social Audit & RTI", "#rti")}>
              <div className="nav-card-icon"><i className="fa-solid fa-magnifying-glass"></i></div>
              <div className="nav-card-text">Social Audit / R.T.I.</div>
            </button>

            <button className="nav-card-btn" onClick={() => handleRedirect("Medical Education", "#medical")}>
              <div className="nav-card-icon"><i className="fa-solid fa-user-doctor"></i></div>
              <div className="nav-card-text">Medical Education</div>
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL NOTIFICATION */}
      <div className={`modal-overlay${modalHidden ? " hidden" : ""}`} id="noticeModal" onClick={handleOverlayClick}>
        <div className="modal-container">
          <div className="modal-header">
            <span>महत्वपूर्ण सूचनाएँ - MMVY</span>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div>सत्र 2025-26 में प्रवेशित विद्यार्थियों के नवीन आवेदन (fresh applications) तथा सत्र 2024-25 एवं सत्र 2023-24 हेतु नवीनीकरण आवेदनों (renewal applications) को पोर्टल पर प्राप्त करने हेतु निम्न तालिकाओं में उल्लेखित तिथि अनुसार आवेदन जमा करने की अंतिम तिथि निर्धारित की जाती है :-</div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div><span className="highlight-red">सत्र 2025-26 (नवीन आवेदन/fresh application) जमा करने हेतु अंतिम तिथि: 20/08/2026</span></div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div><span className="highlight-red">सत्र 2024-25 एवं सत्र 2023-24 के (नवीनीकरण आवेदन/renewal application) जमा करने हेतु अंतिम तिथि: 20/08/2026</span></div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div>अंतिम तिथि के पश्चात आवेदन पोर्टल पर स्वीकार नहीं किए जाएंगे। सत्र 2022-23 एवं इससे पूर्व सत्रों के आवेदनों को जमा करने की निर्धारित तिथि समाप्त हो चुकी है, अतः इन सत्रों के लिए पोर्टल पर कोई भी आवेदन स्वीकार नहीं किया जा रहा है।</div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div>संस्थाओं से अनुरोध है कि, उक्त अंतिम तिथि के संबंध में विद्यार्थियों को तत्काल सूचित करें एवं प्राप्त आवेदनों को सत्यापित एवं स्वीकृत करने का कष्ट करें।</div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div>विलंब की स्थिति में योजना के लाभ से वंचित रह जाने पर समस्त जिम्मेदारी विद्यार्थी/संस्था की होगी।</div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div>किसी प्रकार की समस्या होने पर योजना की हेल्पलाइन <strong>mmvyhelpline.dte@mp.gov.in</strong> पर दिनांक 15.08.2026 तक संपर्क/सूचित करें।</div>
            </div>

            <div className="modal-list-item">
              <i className="fa-solid fa-circle-arrow-right"></i>
              <div><span className="highlight-red">वर्तमान में सत्र 2026-27 के नवीन/नवीनीकरण आवेदन पोर्टल पर स्वीकार नहीं किए जा रहे हैं एवं इन आवेदनों को प्राप्त करने के संबंध में आवश्यक जानकारी पृथक से पोर्टल पर प्रदर्शित की जाएगी।</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING CHAT BUTTON */}
      <div className="fab-btn" onClick={() => alert("Accessibility / Help Desk Assistant Loaded")} title="Help Assistant">
        <i className="fa-solid fa-child-reaching"></i>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        Designed &amp; Developed By NIC Bhopal MP. Portal is best viewed in FireFox, Chrome, Opera, Internet Explorer 8 or + (with Compatibility view mode off/disabled). The screen resolution desired is 1024x768 or above.
      </footer>
    </div>
  );
}
