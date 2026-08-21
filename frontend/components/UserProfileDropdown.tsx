// components/UserProfileDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function UserProfileDropdown({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      {/* Brutalist Trigger Pill */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border-2 border-zinc-950 bg-[#fbfbf7] p-1 pr-4 shadow-[2px_2px_0px_#18181b] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#18181b] active:translate-y-[2px] active:shadow-none"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-8 w-8 rounded-full border-2 border-zinc-950 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-lime-300 text-xs font-black text-zinc-950">
            {name.charAt(0)}
          </div>
        )}
        <span className="hidden text-sm font-black text-zinc-950 sm:block">
          {name.split(" ")[0]}
        </span>
      </button>

      {/* Brutalist Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-60 rounded-2xl border-2 border-zinc-950 bg-white p-2 shadow-[8px_8px_0px_#18181b]">
          {/* User Info Header */}
          <div className="border-b-2 border-zinc-100 p-3">
            <p className="text-sm font-black text-zinc-950">{name}</p>
            <p className="truncate text-xs font-bold text-zinc-500">{email}</p>
          </div>

          {/* Action Links */}
          <div className="flex flex-col gap-1 pt-2">
            {/* My Resumes (Teaser / Coming Soon) */}
            <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-zinc-400">
              <span>Saved Resumes</span>
              <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-600">
                Soon
              </span>
            </div>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => signOut({ redirectTo: "/" })}
              className="w-full rounded-xl border-2 border-transparent px-3 py-2 text-left text-sm font-black text-rose-500 transition-colors hover:border-zinc-950 hover:bg-rose-100 hover:text-zinc-950"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}