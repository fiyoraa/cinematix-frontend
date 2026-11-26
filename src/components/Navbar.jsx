import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  CalendarClock,
  Ticket,
  Shield,
  LogOut,
  LogIn,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isTheaterMode = location.pathname.startsWith('/showtimes/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const desktopLinkClass = ({ isActive }) => {
    if (isTheaterMode) {
      return `inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? 'border-brass text-white'
          : 'border-transparent text-zinc-400 hover:text-white'
      }`;
    }
    return `inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-velvet text-velvet font-semibold'
        : 'border-transparent text-muted hover:text-ink'
    }`;
  };

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
      isActive ? 'text-velvet font-semibold' : 'text-muted hover:text-ink'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-colors ${
          isTheaterMode
            ? 'bg-obsidian/95 border-slateLine text-white backdrop-blur-md'
            : 'bg-ivory/95 border-sand text-ink backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/movies" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded bg-velvet text-white flex items-center justify-center font-display font-extrabold text-sm tracking-wider border border-velvet-hover">
              CT
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg leading-none tracking-tight">
                CinemaTix
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.18em] mt-0.5 ${
                  isTheaterMode ? 'text-zinc-400' : 'text-muted'
                }`}
              >
                Reservasi Sinema
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 h-full">
            <NavLink to="/movies" className={desktopLinkClass}>
              <Film className="w-4 h-4" />
              <span>Sedang Tayang</span>
            </NavLink>
            <NavLink to="/schedule" className={desktopLinkClass}>
              <CalendarClock className="w-4 h-4" />
              <span>Jadwal Studio</span>
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/bookings" className={desktopLinkClass}>
                <Ticket className="w-4 h-4" />
                <span>Tiket Saya</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={desktopLinkClass}>
                <Shield className="w-4 h-4" />
                <span>Panel Admin</span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border text-xs ${
                    isTheaterMode
                      ? 'bg-charcoal border-slateLine text-zinc-200'
                      : 'bg-white border-sand text-ink'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-brass" />
                  <span className="font-medium max-w-[120px] truncate">
                    {user?.username}
                  </span>
                  <span
                    className={`font-mono uppercase text-[10px] px-1.5 py-0.5 rounded ${
                      isAdmin
                        ? 'bg-velvet text-white'
                        : isTheaterMode
                        ? 'bg-obsidian text-zinc-300'
                        : 'bg-ivory text-muted border border-sand'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    isTheaterMode
                      ? 'border-slateLine text-zinc-300 hover:bg-charcoal hover:text-white'
                      : 'border-sand bg-white text-ink hover:border-velvet hover:text-velvet'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-velvet hover:bg-velvet-hover text-white text-xs sm:text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand grid grid-cols-4 px-2 pb-safe"
      >
        <NavLink to="/movies" className={mobileLinkClass}>
          <Film className="w-4 h-4" />
          <span>Katalog</span>
        </NavLink>
        <NavLink to="/schedule" className={mobileLinkClass}>
          <CalendarClock className="w-4 h-4" />
          <span>Jadwal</span>
        </NavLink>
        {isAuthenticated ? (
          <NavLink to="/bookings" className={mobileLinkClass}>
            <Ticket className="w-4 h-4" />
            <span>Tiket Saya</span>
          </NavLink>
        ) : (
          <NavLink to="/login" className={mobileLinkClass}>
            <LogIn className="w-4 h-4" />
            <span>Masuk</span>
          </NavLink>
        )}
        {isAdmin ? (
          <NavLink to="/admin" className={mobileLinkClass}>
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </NavLink>
        ) : isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted hover:text-velvet"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        ) : (
          <NavLink to="/login?tab=register" className={mobileLinkClass}>
            <User className="w-4 h-4" />
            <span>Daftar</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}
