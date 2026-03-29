'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UnitToggle from './UnitToggle';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/log', label: 'Log Set' },
  { href: '/exercises', label: 'Exercises' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950 px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between py-3">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-white tracking-tight">
            erepmax
          </span>
          <div className="flex gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <UnitToggle />
      </div>
    </nav>
  );
}
