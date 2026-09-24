"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  BrainCircuit,
  ClipboardList,
  FileSearch,
  GitBranch,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "New Investigation",
    href: "/investigation",
    icon: Plus,
  },
  {
    label: "Case Queue",
    href: "/cases",
    icon: ClipboardList,
  },
  {
    label: "Graph Intelligence",
    href: "/graph",
    icon: GitBranch,
  },
  {
    label: "Evidence",
    href: "/evidence",
    icon: FileSearch,
  },
  {
    label: "Actions & Policy",
    href: "/actions",
    icon: ShieldCheck,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-mark">
          <BrainCircuit size={22} />
        </div>

        <div>
          <div className="brand-title">
            FRAUD INTELLIGENCE
          </div>

          <div className="brand-subtitle">
            AGENT CONSOLE
          </div>
        </div>

      </div>

      <nav className="sidebar-nav">

        {navigation.map((item) => {

          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${
                active ? "active" : ""
              }`}
            >
              <Icon size={19} />

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}

      </nav>

      <Link
        href="/investigation"
        className="new-case-button"
      >
        <Plus size={18} />

        <span>
          New Case
        </span>
      </Link>

      <div className="sidebar-status">

        <div className="online-row">
          <span className="online-dot" />

          <span>
            Agent Online
          </span>
        </div>

        <div className="service">
          <Zap size={14} />
          Gemini
        </div>

        <div className="service">
          <GitBranch size={14} />
          TigerGraph
        </div>

        <div className="service">
          <Activity size={14} />
          FastAPI
        </div>

      </div>

    </aside>
  );
}