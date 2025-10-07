import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  FiHome,
  FiFolder,
  FiFolderPlus,
  FiCheckSquare,
  FiList,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiCheckCircle,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import { getNavigationItems } from '../config/rolePermissions';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Get role-based navigation items
  const navigation = getNavigationItems(user?.role || 'member');

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    FiHome,
    FiFolder,
    FiFolderPlus,
    FiCheckSquare,
    FiList,
    FiUsers,
    FiUserCheck,
    FiCalendar,
    FiCheckCircle,
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            {isSidebarOpen && (
              <h1 className="text-xl font-bold text-primary-600">
                Project Tracker
              </h1>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={!isSidebarOpen ? `${item.name} - ${item.description}` : undefined}
                >
                  <Icon size={20} />
                  {isSidebarOpen && (
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              title={!isSidebarOpen ? 'Profile' : undefined}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="text-primary-600" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {user?.role}
                  </p>
                </div>
              )}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title={!isSidebarOpen ? 'Logout' : undefined}
            >
              <FiLogOut size={20} />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

