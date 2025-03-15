
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Car, FileText, AlertTriangle, User, Settings, Menu, X, Users, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  
  const navItems = [
    { 
      name: 'Veículos', 
      icon: <Car className="h-5 w-5" />, 
      path: '/',
      filter: '?category=Veículo'
    },
    { 
      name: 'Habilitação', 
      icon: <User className="h-5 w-5" />, 
      path: '/',
      filter: '?category=Habilitação'
    },
    { 
      name: 'Infrações', 
      icon: <AlertTriangle className="h-5 w-5" />, 
      path: '/',
      filter: '?category=Infrações'
    },
    { 
      name: 'Documentos', 
      icon: <FileText className="h-5 w-5" />, 
      path: '/',
      filter: '?category=Outros'
    },
  ];
  
  const adminItems = [
    { 
      name: 'Admin', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/admin' 
    },
    { 
      name: 'Usuários', 
      icon: <Users className="h-5 w-5" />, 
      path: '/users' 
    },
  ];
  
  const isActiveLink = (path: string, filter?: string) => {
    if (!filter) return location.pathname === path;
    return location.pathname === path && location.search === filter;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-detran rounded-md h-8 w-8 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold">
                <span className="text-detran">Check</span>Doc<span className="text-muted-foreground">DETRAN</span>
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {/* Regular nav items */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={`${item.path}${item.filter || ''}`}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                  isActiveLink(item.path, item.filter)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {/* Admin nav items - only show if authenticated */}
            {isAuthenticated && (
              <>
                {adminItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                      isActiveLink(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </>
            )}
            
            {/* Login button - only show if not authenticated */}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User className="h-5 w-5" />
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.div
              className="absolute top-16 left-0 bottom-0 w-64 bg-background"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 space-y-1">
                {/* Regular nav items */}
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={`${item.path}${item.filter || ''}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActiveLink(item.path, item.filter)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                
                {/* Admin nav items - only show if authenticated */}
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-border my-2" />
                    {adminItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActiveLink(item.path)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                      Sair
                    </button>
                  </>
                )}
                
                {/* Login button - only show if not authenticated */}
                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      Login
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + location.search}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
