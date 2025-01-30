import { Link, useRouter } from "@tanstack/react-router";
import Image from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "/src/assets/ic_dashboard.svg",
    activeIcon: "/src/assets/ic_dashboard_active.svg",
  },
  {
    href: "/info",
    label: "Info Pegawai",
    icon: "/src/assets/ic_info_pegawai.svg",
    activeIcon: "/src/assets/ic_dashboard_active.svg",
  },
  {
    href: "/lainnya",
    label: "Lainnya",
    icon: "/src/assets/ic_lainnya.svg",
    activeIcon: "/src/assets/ic_dashboard_active.svg",
  },
  {
    href: "/akun",
    label: "Akun",
    icon: "/src/assets/ic_akun.svg",
    activeIcon: "/src/assets/ic_akun_active.svg",
  },
];

const BottomNavigation = () => {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <div className="fixed bottom-0 w-full h-16 bg-white flex justify-around items-center shadow-lg text-xs font-poppins">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="flex flex-col items-center"
        >
          <button
            className={
              currentPath === item.href
                ? "text-primary font-bold"
                : "text-textGray"
            }
          >
            <img
              src={currentPath === item.href ? item.activeIcon : item.icon}
              alt={`${item.label} Icon`}
            />
            <span>{item.label}</span>
          </button>
        </Link>
      ))}
    </div>
  );
};

export default BottomNavigation;
