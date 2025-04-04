import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { GraduationCap, Search, Bell, Menu, LogOut, User, BookOpen, ChartBarStacked } from "lucide-react";

export default function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center">
            <GraduationCap className="mr-2" />
            <span>eduNest</span>
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:block flex-grow max-w-2xl mx-8">
          <form className="relative" onSubmit={handleSearch}>
            <Input
              type="text"
              placeholder="Search for courses, topics, or instructors"
              className="w-full py-2 pl-10 pr-4 bg-gray-100 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Search size={16} />
            </span>
          </form>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/courses">
            <Button variant="ghost" className={location === "/courses" ? "text-primary" : ""}>
              Browse
            </Button>
          </Link>
          
          {user && user.role !== "instructor" && (
            <Link href="/my-learning">
              <Button variant="ghost" className={location === "/my-learning" ? "text-primary" : ""}>
                My Learning
              </Button>
            </Link>
          )}
          
          {user && user.role === "instructor" && (
            <Link href="/instructor/dashboard">
              <Button variant="ghost" className={location.startsWith("/instructor") ? "text-primary" : ""}>
                Instructor
              </Button>
            </Link>
          )}
          
          {/* Notifications */}
          {user && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          )}
          
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {user.role !== "instructor" && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-learning" className="flex items-center cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>My Learning</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "instructor" && (
                  <DropdownMenuItem asChild>
                    <Link href="/instructor/dashboard" className="flex items-center cursor-pointer">
                      <ChartBarStacked className="mr-2 h-4 w-4" />
                      <span>Instructor Portal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button size="lg" className="font-medium">Register</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={onMobileMenuToggle}>
            <Menu />
          </Button>
        </div>
      </div>

      {/* Mobile Search (Visible when screen is small) */}
      <div className="md:hidden border-t border-gray-200 py-3 px-4">
        <form className="relative" onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="Search for anything"
            className="w-full py-2 pl-10 pr-4 bg-gray-100 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <Search size={16} />
          </span>
        </form>
      </div>
    </header>
  );
}
