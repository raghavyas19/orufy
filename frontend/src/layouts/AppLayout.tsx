import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Home, Menu, ShoppingBag, Search, LogOut, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/auth";

export type HeaderContext = {
  setHeaderSearchVisible: (visible: boolean) => void;
  headerSearchValue: string;
  setHeaderSearchValue: (value: string) => void;
};

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "Products", icon: ShoppingBag },
] as const;

export default function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const [headerSearchVisible, setHeaderSearchVisible] = useState(false);
  const [headerSearchValue, setHeaderSearchValue] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex bg-background">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[220px] -translate-x-full bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 lg:translate-x-0 lg:fixed lg:top-0 lg:left-0 lg:h-full lg:translate-x-0">
        <div className="px-5 py-5">
          <Logo light />
        </div>
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/50" />
            <input
              placeholder="Search"
              className="w-full h-8 pl-8 pr-3 rounded-md bg-[#2F343D] text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none"
            />
          </div>
        </div>
        <nav className="px-2 flex-1 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition ${
                  active ? "text-white font-semibold" : "text-[#98A2B3] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[220px]">
        <header
          className="sticky top-0 z-40 border-b border-border px-4 py-3 sm:px-6 sm:py-0 sm:h-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#FFECEF] via-[#FFF9E6] to-[#E8F6FF]"
        >
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <div className="flex items-center gap-2 min-w-0 text-sm font-semibold text-foreground capitalize">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
              {pathname === "/products" ? (
                <div className="flex items-center gap-2 text-[#344054]">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="font-semibold">Products</span>
                </div>
              ) : pathname === "/" ? null : (
                pathname.replace("/", "")
              )}
            </div>
          </div>
          <div className="flex items-center ml-3">
            {/* show header search to the right, before profile, except on Home page */}
            {pathname !== "/" && headerSearchVisible && (
              <div className="relative mr-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  placeholder="Search Services, Products"
                  value={headerSearchValue}
                  onChange={(event) => setHeaderSearchValue(event.target.value)}
                  className="w-[220px] h-9 pl-9 pr-3 rounded-md bg-[#F3F4F6] text-xs placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            <ProfileMenu userEmail={user?.email || "user@example.com"} />
          </div>
        </header>
        <main className="flex-1 bg-background pt-14">
          <Outlet context={{ setHeaderSearchVisible, headerSearchValue, setHeaderSearchValue }} />
        </main>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo light />
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/50" />
            <input
              placeholder="Search"
              className="w-full h-8 pl-8 pr-3 rounded-md bg-[#2F343D] text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none"
            />
          </div>
        </div>
        <nav className="px-2 flex-1 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition ${
                  active ? "text-white font-semibold" : "text-[#98A2B3] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function ProfileMenu({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex items-center" ref={ref}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-semibold">
        P
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
        aria-label="Open profile menu"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-border shadow-lg z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Profile</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/login");
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
