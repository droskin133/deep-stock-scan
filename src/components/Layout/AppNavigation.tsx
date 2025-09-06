import { Link, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { StockSearch } from '@/components/StockSearch';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from '@/hooks/useUserSettings';

export function AppNavigation() {
  const { user, profile, signOut } = useAuth();
  const { settings, updateTheme } = useUserSettings();
  const location = useLocation();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
      case 'president':
        return 'default';
      case 'premium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
      case 'president':
        return <Crown className="h-3 w-3 mr-1" />;
      case 'premium':
        return <Zap className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const toggleTheme = () => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
    
    // Apply theme immediately
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              AI DayTrader Pro
            </span>
          </Link>
        </div>

        {/* Center Search - Hide on mobile for auth page */}
        {location.pathname !== '/auth' && (
          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <StockSearch className="w-full" />
          </div>
        )}

        {/* Right Navigation */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <NotificationCenter />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.initials || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email || user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant={getRoleBadgeVariant(profile?.role)} className="text-xs">
                          {getRoleIcon(profile?.role)}
                          {profile?.role?.toUpperCase() || 'TRIAL'}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={toggleTheme}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Toggle Theme</span>
                  </DropdownMenuItem>
                  
                  {['premium', 'basic', 'trial'].includes(profile?.role || '') && (
                    <DropdownMenuItem>
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Upgrade Plan</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}