import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-slate-800 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold tracking-wide">
        To-Do App <span className="text-xs font-normal text-slate-400">(Supabase Connected)</span>
      </h1>
      
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 bg-slate-700 px-3 py-1 rounded-full">
            {user.email}
          </span>
          <button
            onClick={onLogout}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded transition font-medium"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
          Not Authenticated
        </div>
      )}
    </nav>
  );
};

export default Navbar;