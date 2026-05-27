import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, QrCode, FileBarChart, Settings, Bell, LogOut, Search, Users as UsersIcon, Menu, X } from "lucide-react";
import { cn } from "../lib/utils";

const navigation = [
  { name: "แดชบอร์ด", href: "/", icon: LayoutDashboard },
  { name: "รายการครุภัณฑ์", href: "/assets", icon: Package },
  { name: "สแกน QR Code", href: "/scan", icon: QrCode },
  { name: "รายงาน", href: "/reports", icon: FileBarChart },
  { name: "จัดการผู้ใช้งาน", href: "/users", icon: UsersIcon },
  { name: "ตั้งค่า", href: "/settings", icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col h-full",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 bg-slate-950">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-indigo-500 mr-3" />
            <span className="text-white font-display font-bold text-xl tracking-tight">ระบบครุภัณฑ์</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    "group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-colors"
                  )}
                >
                  <item.icon className={cn(isActive ? "text-indigo-400" : "text-slate-500", "mr-4 h-6 w-6")} />
                  {item.name}
                </Link> // Line intentionally matches existing format style
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-slate-900 border-r border-slate-800">
        <div className="flex h-16 items-center flex-shrink-0 px-6 bg-slate-950">
          <Package className="h-8 w-8 text-indigo-500 mr-3" />
          <span className="text-white font-display font-bold text-xl tracking-tight">ระบบครุภัณฑ์</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300",
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 bg-slate-950 p-4">
          <div className="flex items-center w-full">
            <div className="ml-3">
              <p className="text-sm font-medium text-white">ผู้ดูแลระบบ IT</p>
              <p className="text-xs font-medium text-slate-500 group-hover:text-slate-400">admin@company.com</p>
            </div>
            <button className="ml-auto text-slate-500 hover:text-slate-300">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Column */}
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-slate-200">
          <div className="flex flex-1 items-center justify-between px-4 sm:px-6 md:px-8">
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">เปิดเมนู</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-1 md:ml-0 ml-4">
              <form className="flex w-full" action="#" method="GET">
                <div className="relative w-full text-slate-400 focus-within:text-slate-600 max-w-md">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search-field"
                    className="block h-full w-full border-transparent py-2 pl-8 pr-3 bg-transparent text-slate-900 placeholder-slate-500 focus:border-transparent focus:placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="ค้นหาครุภัณฑ์ด้วยรหัส, ชื่อ หรือซีเรียล..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative"
              >
                <span className="sr-only">ดูการแจ้งเตือน</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
