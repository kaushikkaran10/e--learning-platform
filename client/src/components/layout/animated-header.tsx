import React from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, BookOpen, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemedSpinner, type SpinnerTheme } from "@/components/ui/themed-spinner";
import { cn } from "@/lib/utils";

interface AnimatedHeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function AnimatedHeader({ onMobileMenuToggle }: AnimatedHeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [theme, setTheme] = React.useState<SpinnerTheme>("book");
  
  // Change the theme based on the current route
  React.useEffect(() => {
    if (location.includes("/courses")) {
      setTheme("book");
    } else if (location.includes("/learn")) {
      setTheme("graduate");
    } else if (location.includes("/instructor")) {
      setTheme("pencil");
    } else if (location.includes("/auth")) {
      setTheme("lightbulb");
    } else if (location.includes("/spinners")) {
      setTheme("art");
    } else {
      setTheme("code");
    }
  }, [location]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <button
          className="mr-4 md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </button>
        
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <ThemedSpinner theme={theme} size="md" className="absolute" />
            <GraduationCap className={cn(
              "h-5 w-5 text-primary z-10 transition-transform duration-300",
              theme === "book" && "scale-110",
              theme === "graduate" && "scale-125 rotate-12",
              theme === "pencil" && "scale-90 -rotate-12",
              theme === "code" && "scale-105 rotate-6",
              theme === "lightbulb" && "scale-110 -rotate-6",
              theme === "art" && "scale-110 rotate-12",
            )} />
          </div>
          <span className="text-xl font-bold">eduNest</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link 
            href="/courses" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.includes("/courses") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Courses
          </Link>
          {user && (
            <>
              <Link 
                href="/my-learning" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === "/my-learning" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                My Learning
              </Link>
              {user.role === "instructor" && (
                <Link 
                  href="/instructor/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.includes("/instructor") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Instructor Portal
                </Link>
              )}
            </>
          )}
          <Link 
            href="/ui/spinners" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location === "/ui/spinners" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Spinners Demo
          </Link>
        </nav>
        
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-learning">My Learning</Link>
                </DropdownMenuItem>
                {user.role === "instructor" && (
                  <DropdownMenuItem asChild>
                    <Link href="/instructor/dashboard">Instructor Portal</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <div className="flex items-center">
                      <ThemedSpinner theme="book" size="sm" className="mr-2" />
                      <span>Logging out...</span>
                    </div>
                  ) : (
                    "Log Out"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Login
                </Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}