import { ReactNode, useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, QrCode, FileBarChart, Settings, Bell, LogOut, Search, Users as UsersIcon, Menu, X, Database, HardDrive, User, Clock, AlertTriangle, Wrench, Trash2 } from "lucide-react";
import { cn, formatThaiDateTime } from "../lib/utils";
import { isSupabaseConfigured, getNotifications } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { AppNotification } from "../types";
// import { format } from "date-fns";
// import { th } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

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
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`dismissedNotificationIds_${user?.email || 'guest'}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`dismissedNotificationIds_${user.email}`, JSON.stringify(Array.from(dismissedIds)));
    }
  }, [dismissedIds, user?.email]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDbConnected(isSupabaseConfigured());
    
    // Fetch notifications
    getNotifications().then(setNotifications);

    // Refresh notifications every 5 minutes
    const interval = setInterval(() => {
      getNotifications().then(setNotifications);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDismissNotification = (id: string, e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleClearAll = () => {
    setDismissedIds(prev => {
      const newSet = new Set(prev);
      notifications.forEach(n => newSet.add(n.id));
      return newSet;
    });
  };

  const activeNotifications = notifications.filter(n => !dismissedIds.has(n.id));
  const unreadCount = activeNotifications.filter(n => !n.is_read).length;

  const filteredNavigation = navigation.filter(item => {
    if (user?.role === 'User') {
      return item.href === '/assets' || item.href === '/scan';
    }
    return true;
  });

  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'ผู้ใช้งาน';
  const roleName = user?.role || 'สมาชิก';

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
        "fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out md:hidden flex flex-col h-full",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 bg-white border-b border-slate-100">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary flex-shrink-0 mr-3" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">ระบบบริหารจัดการ</span>
              <span className="text-slate-900 font-display font-bold text-lg leading-none tracking-tight">ครุภัณฑ์</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 space-y-1 px-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    "group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-colors"
                  )}
                >
                  <item.icon className={cn(isActive ? "text-primary" : "text-slate-400", "mr-4 h-6 w-6")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 bg-slate-50 p-4 border-t border-slate-200">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden text-left">
              <p className="text-sm font-medium text-slate-900 truncate">{userDisplayName}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{roleName}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-white border-r border-slate-200">
        <div className="flex h-16 items-center flex-shrink-0 px-6 bg-white border-b border-slate-100">
          <Package className="h-8 w-8 text-primary flex-shrink-0 mr-3" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">ระบบบริหารจัดการ</span>
            <span className="text-slate-900 font-display font-bold text-lg leading-none tracking-tight">ครุภัณฑ์</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 space-y-1 px-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600",
                      "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 bg-slate-50 p-4 flex-col space-y-3 border-t border-slate-200">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{userDisplayName}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{roleName}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Column */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-slate-200">
          <div className="flex flex-1 items-center justify-between px-4 sm:px-6 md:px-8">
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
                    className="block h-full w-full border-transparent py-2 pl-8 pr-3 bg-transparent text-slate-900 placeholder-slate-400 focus:border-transparent focus:placeholder-slate-500 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="ค้นหาครุภัณฑ์ด้วยรหัส, ชื่อ หรือซีเรียล..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6 relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative transition-all",
                  showNotifications ? "bg-primary text-white" : "bg-slate-50 text-slate-400 hover:text-slate-500 hover:bg-slate-100"
                )}
              >
                <span className="sr-only">ดูการแจ้งเตือน</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 z-50 overflow-hidden transform origin-top-right transition-all"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div className="flex items-center">
                        <h3 className="text-sm font-bold text-slate-900">การแจ้งเตือนระบบ</h3>
                        {unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                            {unreadCount} ใหม่
                          </span>
                        )}
                      </div>
                      {activeNotifications.length > 0 && (
                        <button 
                          onClick={handleClearAll}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          ล้างทั้งหมด
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {activeNotifications.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          <AnimatePresence initial={false}>
                            {activeNotifications.map((n) => (
                              <motion.div
                                key={n.id}
                                layout
                                initial={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 100 }}
                                dragElastic={{ left: 0, right: 0.5 }}
                                onDragEnd={(_, info) => {
                                  if (info.offset.x > 80) {
                                    setDismissedIds(prev => new Set([...prev, n.id]));
                                  }
                                }}
                                className="relative overflow-hidden bg-white group"
                              >
                                {/* Swipe Action Indicator */}
                                <div className="absolute inset-0 bg-rose-50 flex items-center px-6 -z-10 bg-opacity-50">
                                  <Trash2 className="w-5 h-5 text-rose-500" />
                                </div>

                                <Link
                                  to={n.related_id ? `/assets/${n.related_id}` : '#'}
                                  onClick={() => setShowNotifications(false)}
                                  className="block p-4 bg-white hover:bg-slate-50 transition-colors relative"
                                >
                                  <div className="flex items-start">
                                    <div className={cn(
                                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 mt-0.5",
                                      n.type === 'maintenance' ? "bg-amber-100 text-amber-600" :
                                      n.type === 'status' ? "bg-rose-100 text-rose-600" :
                                      "bg-blue-100 text-blue-600"
                                    )}>
                                      {n.type === 'maintenance' ? <Wrench className="w-5 h-5" /> :
                                       n.type === 'status' ? <AlertTriangle className="w-5 h-5" /> :
                                       <Clock className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                      <p className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary transition-colors">
                                        {n.title}
                                      </p>
                                      <p className="text-xs text-slate-500 line-clamp-2">
                                        {n.message}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                        {formatThaiDateTime(n.created_at)}
                                      </p>
                                    </div>
                                    
                                    <div className="absolute right-4 top-4 flex flex-col items-end space-y-2">
                                      {!n.is_read && (
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                      )}
                                      <button
                                        onClick={(e) => handleDismissNotification(n.id, e)}
                                        className="p-1 text-slate-300 hover:text-slate-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded"
                                        title="ซ่อนการแจ้งเตือน"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-slate-400 font-medium">ไม่มีการแจ้งเตือนใหม่</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                      <button className="w-full py-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors text-center uppercase tracking-widest">
                        ดูการแจ้งเตือนทั้งหมด
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <div className="py-6 px-4 sm:px-6 md:px-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
