export type DashboardNavItem = {
  label: string;
  href: string;
  icon: string;
};

export const dashboardPrimaryNav: DashboardNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "grid_view",
  },
  {
    label: "Create Design",
    href: "/dashboard/generator",
    icon: "auto_awesome",
  },
  {
    label: "My Designs",
    href: "/dashboard/designs",
    icon: "palette",
  },
  {
    label: "Mockups",
    href: "/dashboard/mockups",
    icon: "checkroom",
  },
  {
    label: "Storefront",
    href: "/dashboard/storefront",
    icon: "storefront",
  },
  {
    label: "Templates Marketplace",
    href: "/dashboard/templates",
    icon: "auto_awesome_motion",
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: "shopping_cart",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: "query_stats",
  },
];

export const dashboardSecondaryNav: DashboardNavItem[] = [
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: "person",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: "payments",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "settings",
  },
];

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
