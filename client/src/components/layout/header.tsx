import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    return location === path ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-2xl cursor-pointer">LearnHub</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/")}`}>
                  Home
                </a>
              </Link>
              <Link href="/courses">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/courses")}`}>
                  Courses
                </a>
              </Link>
              {user && (
                <Link href="/my-learning">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/my-learning")}`}>
                    My Learning
                  </a>
                </Link>
              )}
              <Link href="/instructors">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActivePath("/instructors")}`}>
                  Instructors
                </a>
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form className="relative mx-4 w-80" onSubmit={handleSearch}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="Search for courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {user ? (
              <div className="ml-3 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)}
                        alt={user.name} 
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-learning">
                        <a className="cursor-pointer w-full">My Learning</a>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "instructor" && (
                      <DropdownMenuItem asChild>
                        <Link href="/instructor-dashboard">
                          <a className="cursor-pointer w-full">Instructor Dashboard</a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="cursor-pointer w-full">Profile</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <a className="cursor-pointer w-full">Settings</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth">
                  <a className="inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Sign in
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Sign up
                  </a>
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location === "/" 
                  ? "border-primary text-primary bg-primary/10" 
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}>
                Home
              </a>
            </Link>
            <Link href="/courses">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location === "/courses"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}>
                Courses
              </a>
            </Link>
            {user && (
              <Link href="/my-learning">
                <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location === "/my-learning"
                    ? "border-primary text-primary bg-primary/10"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  My Learning
                </a>
              </Link>
            )}
            <Link href="/instructors">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location === "/instructors"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}>
                Instructors
              </a>
            </Link>
          </div>

          <div className="px-4 py-3">
            <form className="relative" onSubmit={handleSearch}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                placeholder="Search for courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded-full" 
                    src={user.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)} 
                    alt={user.name} 
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/my-learning">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    My Learning
                  </a>
                </Link>
                {user.role === "instructor" && (
                  <Link href="/instructor-dashboard">
                    <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                      Instructor Dashboard
                    </a>
                  </Link>
                )}
                <Link href="/profile">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Profile
                  </a>
                </Link>
                <Link href="/settings">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                    Settings
                  </a>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex space-x-3">
              <Link href="/auth">
                <a className="w-1/2 flex justify-center items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50">
                  Sign in
                </a>
              </Link>
              <Link href="/auth">
                <a className="w-1/2 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                  Sign up
                </a>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
