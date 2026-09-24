"use client";

import {
  Bell,
  Search,
  Shield,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">

      <div className="greeting">

        <span>
          HEY HHG,
        </span>

        <strong>
          From Tamosa!
        </strong>

      </div>

      <div className="search-box">

        <Search size={16} />

        <input
          placeholder="Search cases, customers, transactions..."
        />

      </div>

      <div className="topbar-actions">

        <button className="icon-button">
          <Bell size={18} />
        </button>

        <div className="profile">

          <div className="profile-avatar">
            T
          </div>

          <div className="profile-info">

            <strong>
              Analyst
            </strong>

            <span>
              Investigation Desk
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}