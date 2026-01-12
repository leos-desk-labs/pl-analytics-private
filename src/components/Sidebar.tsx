'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Executive Overview', icon: '◆', color: '#e7ff01' },
  { href: '/youtube', label: 'YouTube', icon: '▶', color: '#FF0000' },
  { href: '/instagram', label: 'Instagram', icon: '◆', color: '#E4405F' },
  { href: '/tiktok', label: 'TikTok', icon: '♪', color: '#00f2ea' },
  { href: '/facebook', label: 'Facebook', icon: 'f', color: '#1877F2' },
  { href: '/x', label: 'X (Twitter)', icon: '𝕏', color: '#ffffff' },
  { href: '/linkedin', label: 'LinkedIn', icon: 'in', color: '#0A66C2' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1117] min-h-screen p-4 flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="mb-8 px-2 pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://peoplesleaguegolf.com/wp-content/uploads/2024/08/PL-_-PRIMARY-LOGO-.png"
          alt="Peoples League"
          className="w-32 h-auto mb-1"
        />
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Analytics Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs border"
                style={{
                  borderColor: item.color,
                  color: isActive ? item.color : '#6b7280'
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 text-center">
          © 2026 Peoples League
        </p>
      </div>
    </aside>
  );
}
