// components/layout/Navigation.tsx
import {
  FiHome,
  FiBookmark,
  FiFolder,
  FiCompass,
  FiUser,
} from "react-icons/fi";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navItems = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/bookmarks", label: "Saved", icon: FiBookmark },
    { path: "/collections", label: "Collections", icon: FiFolder },
    { path: "/discover", label: "Discover", icon: FiCompass },
    { path: "/profile", label: "Profile", icon: FiUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-10">
      <div className="max-w-xl mx-auto flex justify-between">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg ${
              isActive(item.path)
                ? "text-purple-600 bg-purple-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {item.icon && <item.icon size={20} className="mb-1" />}
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
