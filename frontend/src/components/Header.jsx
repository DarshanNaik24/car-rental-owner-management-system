import React from 'react';
import { Menu, Plus, KeyRound, Car } from 'lucide-react';

export const Header = ({ onOpenMobileMenu, onNewRental, onNewCar, title, subtitle }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs font-medium text-slate-500 hidden md:inline-block bg-slate-100 px-2.5 py-1 rounded-lg">
          {today}
        </span>

        {onNewCar && (
          <button
            onClick={onNewCar}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Car</span>
          </button>
        )}

        {onNewRental && (
          <button
            onClick={onNewRental}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-600/20 transition active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>New Rental</span>
          </button>
        )}
      </div>
    </header>
  );
};
