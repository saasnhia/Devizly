"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DevizlyLogo } from "@/components/devizly-logo";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  CreditCard,
  Brain,
  Kanban,
  Receipt,
  LogOut,
  Menu,
  X,
  LayoutTemplate,
  FileInput,
  Inbox,
  FileSignature,
  UsersRound,
  Timer,
  Calculator,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { NotificationBell } from "@/components/layout/notification-bell";
import { GlobalSearch } from "@/components/layout/global-search";

/* ── Navigation structure ─────────────────────────── */

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title?: string; // undefined = no section header
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/briefing", label: "Briefing IA", icon: Brain, badge: "IA", badgeColor: "violet" },
    ],
  },
  {
    title: "COMMERCIAL",
    items: [
      { href: "/devis", label: "Devis", icon: FileText },
      { href: "/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
      { href: "/dashboard/relances", label: "Relances", icon: Bell },
    ],
  },
  {
    title: "FINANCES",
    items: [
      { href: "/dashboard/factures", label: "Factures", icon: Receipt },
      { href: "/dashboard/urssaf", label: "URSSAF", icon: Calculator },
      { href: "/contrats", label: "Contrats", icon: FileSignature },
    ],
  },
  {
    title: "CLIENTS",
    items: [
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/timer", label: "Temps", icon: Timer },
      { href: "/lead-forms", label: "Formulaires", icon: FileInput },
      { href: "/leads", label: "Leads", icon: Inbox },
    ],
  },
  {
    title: "ÉQUIPE",
    items: [
      { href: "/equipe", label: "Équipe", icon: UsersRound },
    ],
  },
];

const bottomItems: NavItem[] = [
  { href: "/parametres", label: "Paramètres", icon: Settings },
  { href: "/pricing", label: "Tarifs", icon: CreditCard },
];

// Mobile bottom bar (5 key items)
const mobileNav: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/dashboard/factures", label: "Factures", icon: Receipt },
  { href: "/parametres", label: "Réglages", icon: Settings },
];

/* ── Helpers ──────────────────────────────────────── */

function planBadge(status: string): { label: string; className: string } {
  if (status === "business") return { label: "Business", className: "bg-amber-100 text-amber-700" };
  if (status === "pro") return { label: "Pro", className: "bg-violet-100 text-violet-700" };
  return { label: "Gratuit", className: "bg-slate-100 text-slate-500" };
}

/* ── Component ────────────────────────────────────── */

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");

  useEffect(() => {
    async function loadPlan() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status) setSubscriptionStatus(data.subscription_status);
    }
    loadPlan();
  }, [user.id]);

  const initials = (user.user_metadata?.full_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const plan = planBadge(subscriptionStatus);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function NavLink({ item }: { item: NavItem }) {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-r-lg py-2 pl-3 pr-2 text-[13px] font-medium transition-all duration-150 ${
          active
            ? "border-l-[3px] border-violet-600 bg-[#F3F0FF] text-[#5B5BD6]"
            : "border-l-[3px] border-transparent text-slate-500 hover:bg-[#F8F9FC] hover:text-slate-900"
        }`}
      >
        <item.icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
            item.badgeColor === "violet"
              ? "bg-[#EDE9FE] text-[#5B5BD6]"
              : "bg-slate-100 text-slate-500"
          }`}>
            {item.badge}
          </span>
        )}
        {item.href === "/pricing" && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${plan.className}`}>
            {plan.label}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-5">
          <Link href="/dashboard" className="transition-transform hover:scale-105">
            <DevizlyLogo width={130} height={32} />
          </Link>
          <NotificationBell />
        </div>

        {/* Search */}
        <div className="px-3 pb-1 pt-3">
          <GlobalSearch />
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 pt-2">
          {sections.map((section, si) => (
            <div key={si}>
              {section.title && (
                <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {section.title}
                </p>
              )}
              {!section.title && si > 0 && <div className="my-2" />}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom items */}
        <div className="border-t px-3 py-2">
          <div className="space-y-0.5">
            {bottomItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* User */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-violet-100 text-xs font-semibold text-violet-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-900">
                {user.user_metadata?.full_name || "Utilisateur"}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-600"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <DevizlyLogo width={110} height={28} />
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t bg-white lg:hidden">
          {mobileNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
                  active ? "text-violet-600" : "text-slate-400"
                }`}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
