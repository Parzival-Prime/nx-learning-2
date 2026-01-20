'use client';

import { usePathname } from 'next/navigation';
import useSidebar from '@seller-ui/src/hooks/useSidebar';
import useSeller from '@seller-ui/src/hooks/useSeller';
import { useEffect } from 'react';
import { Box } from './box';
import { Sidebar } from './sidebar-styles';
import Link from 'next/link';
import Logo from '@seller-ui/src/components/logo';
import SidebarItem from './sidebar-item';
import DashboardIcon from '../assets/icons/dashboard-icon';
import SidebarMenu from './sidebar-menu';
import OrdersIcon from '../assets/icons/orders-icon';
import PaymentsIcon from '../assets/icons/payments-icon';
import CreateProductIcon from '../assets/icons/create-product-icon';
import AllProductsIcon from '../assets/icons/all-products-icon';
import CreateEventIcon from '../assets/icons/create-event-icon';
import AllEventsIcon from '../assets/icons/all-events-icon';
import InboxIcon from '../assets/icons/inbox-icon';
import SettingsIcon from '../assets/icons/settings-icon';
import NotificationIcon from '../assets/icons/notification-icon';
import DiscountIcon from '../assets/icons/discount-icon';
import LogoutIcon from '../assets/icons/logout-icon';

export default function SidebarWrapper() {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getActiveColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#ecedee';
  return (
    <Box
      css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={'/'} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-lg font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-x-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body>
          <SidebarItem
            href="/dashboard"
            title="Dashboard"
            icon={
              <DashboardIcon color={getActiveColor('/dashboard')} size={18} />
            }
            isActive={activeSidebar === '/dashboard'}
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                href="/dashboard/orders"
                title="Orders"
                icon={
                  <OrdersIcon
                    color={getActiveColor('/dashboard/orders')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/orders'}
              />
              <SidebarItem
                href="/dashboard/payments"
                title="Payments"
                icon={
                  <PaymentsIcon
                    color={getActiveColor('/dashboard/payments')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/payments'}
              />
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                href="/dashboard/create-product"
                title="Create Product"
                icon={
                  <CreateProductIcon
                    color={getActiveColor('/dashboard/create-product')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/create-product'}
              />
              <SidebarItem
                href="/dashboard/all-products"
                title="All Products"
                icon={
                  <AllProductsIcon
                    color={getActiveColor('/dashboard/all-products')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/all-products'}
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SidebarItem
                href="/dashboard/create-event"
                title="Create Event"
                icon={
                  <CreateEventIcon
                    color={getActiveColor('/dashboard/create-event')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/create-event'}
              />
              <SidebarItem
                href="/dashboard/all-events"
                title="All Event"
                icon={
                  <AllEventsIcon
                    color={getActiveColor('/dashboard/all-event')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/all-event'}
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                href="/dashboard/inbox"
                title="Inbox"
                icon={
                  <InboxIcon
                    color={getActiveColor('/dashboard/inbox')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/inbox'}
              />
              <SidebarItem
                href="/dashboard/settings"
                title="Settings"
                icon={
                  <SettingsIcon
                    color={getActiveColor('/dashboard/settings')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/settings'}
              />
              <SidebarItem
                href="/dashboard/notifications"
                title="Notifications"
                icon={
                  <NotificationIcon
                    color={getActiveColor('/dashboard/notifications')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/notifications'}
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                href="/dashboard/discount-codes"
                title="Discount Codes"
                icon={
                  <DiscountIcon
                    color={getActiveColor('/dashboard/discount-codes')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/discount-codes'}
              />
              <SidebarItem
                href="/dashboard/logout"
                title="Logout"
                icon={
                  <LogoutIcon
                    color={getActiveColor('/dashboard/logout')}
                    size={18}
                  />
                }
                isActive={activeSidebar === '/dashboard/logout'}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
}
