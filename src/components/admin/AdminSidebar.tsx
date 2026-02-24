import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { enquiryAPI, contactAPI } from '@/lib/api';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  LogOut,
  Home,
  FileSpreadsheet,
  Users,
  Mail
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Add Property', url: '/admin/add-property', icon: Building2 },
  { title: 'Manage Properties', url: '/admin/properties', icon: Building2 },
  { title: 'CSV Import', url: '/admin/csv-import', icon: FileSpreadsheet },
  { title: 'Enquiries', url: '/admin/enquiries', icon: MessageSquare },
  { title: 'Leads', url: '/admin/leads', icon: Users },
  { title: 'Messages', url: '/admin/messages', icon: Mail },
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [unreadEnquiries, setUnreadEnquiries] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const enquiries = await enquiryAPI.getAll();
        const unreadCount = enquiries.filter((e: any) => !e.read).length;
        console.log('📧 Unread Enquiries:', unreadCount);
        setUnreadEnquiries(unreadCount);

        const messages = await contactAPI.getAll();
        console.log('💬 Total Messages:', messages.length);
        const unreadMsgCount = messages.filter((m: any) => !m.read).length;
        console.log('💬 Unread Messages:', unreadMsgCount);
        setUnreadMessages(unreadMsgCount);
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const isActive = (url: string) => {
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(url);
  };

  const getMenuItemWithBadge = (item: typeof menuItems[0]) => {
    if (item.title === 'Enquiries' && unreadEnquiries > 0) {
      return {
        ...item,
        badge: unreadEnquiries
      };
    }
    if (item.title === 'Messages' && unreadMessages > 0) {
      return {
        ...item,
        badge: unreadMessages
      };
    }
    return item;
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold">
              <span className="gradient-text">Prop</span>Finder
            </span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const itemWithBadge = getMenuItemWithBadge(item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      className="hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary relative"
                    >
                      <Link to={item.url} className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </span>
                        {itemWithBadge.badge && (
                          <Badge variant="destructive" className="ml-auto">
                            {itemWithBadge.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-muted/50">
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Back to Site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
