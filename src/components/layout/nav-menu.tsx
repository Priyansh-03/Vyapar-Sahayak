
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";
import { Home, Package, FileOutput, Settings as SettingsIcon, BookUser, History, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar"; // Import useSidebar

const navItems = [
  { href: "/", labelKey: "navHome", icon: Home },
  { href: "/products", labelKey: "navProducts", icon: Package },
  { href: "/generate-bill", labelKey: "navGenerateBill", icon: FileOutput },
  { href: "/udhaar-khata", labelKey: "navUdhaarKhata", icon: BookUser },
  { href: "/history", labelKey: "navHistory", icon: History },
  { href: "/settings", labelKey: "navSettings", icon: SettingsIcon },
  { href: "/contact", labelKey: "navContactUs", icon: Mail },
];

export function NavMenu() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar(); 

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false); 
    }
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={t(item.labelKey)}
                className={cn(
                  isActive && "sidebar-menu-button-active-glow"
                )}
                onClick={handleLinkClick} 
              >
                <Icon />
                <span>{t(item.labelKey)}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
