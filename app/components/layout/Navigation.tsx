// components/layout/Navigation.tsx
import { FiHome, FiBookmark, FiFolder, FiUsers } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navItems = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/bookmarks", label: "Bookmarks", icon: FiBookmark },
    { path: "/collections", label: "Collections", icon: FiFolder },
    { path: "/discover", label: "Discover", icon: FiUsers },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-md ${
            isActive(item.path)
              ? "text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {item.icon && <item.icon size={20} className="mb-1" />}
          <span className="text-xs">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
