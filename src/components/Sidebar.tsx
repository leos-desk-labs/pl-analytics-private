'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Music2,
  Twitter
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/youtube', label: 'YouTube', icon: Youtube },
  { href: '/instagram', label: 'Instagram', icon: Instagram },
  { href: '/facebook', label: 'Facebook', icon: Facebook },
  { href: '/tiktok', label: 'TikTok', icon: Music2 },
  { href: '/x', label: 'X', icon: Twitter },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-brand-teal min-h-screen p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-8 p-4">
        <Image
          src="https://peoplesleaguegolf.com/wp-content/uploads/2024/08/PL-_-PRIMARY-LOGO-.png"
          alt="Peoples League"
          width={180}
          height={60}
          className="mb-2"
          priority
        />
        <p className="text-sm text-gray-400">Analytics Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : 'text-gray-300'}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          © 2026 Peoples League
        </p>
      </div>
    </aside>
  );
}
