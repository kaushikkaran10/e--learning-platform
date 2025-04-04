import { useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  BookOpen, 
  ChartBarStacked, 
  Calendar, 
  MessageSquare, 
  Award, 
  LogOut, 
  Code, 
  ChartPie, 
  Palette, 
  Briefcase, 
  ChevronRight
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left flex items-center">
            <Link href="/" onClick={onClose} className="text-primary font-bold flex items-center gap-2">
              EduLearn
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        {user && (
          <div className="border-b p-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar>
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="py-4 space-y-1">
          <SheetClose asChild>
            <Link href="/">
              <Button 
                variant="ghost" 
                className={`w-full justify-start px-4 ${location === "/" ? "bg-gray-100 text-primary" : ""}`}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Button>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/courses">
              <Button 
                variant="ghost" 
                className={`w-full justify-start px-4 ${location === "/courses" ? "bg-gray-100 text-primary" : ""}`}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Browse Courses
              </Button>
            </Link>
          </SheetClose>
          
          {user && (
            <>
              {user.role !== "instructor" && (
                <SheetClose asChild>
                  <Link href="/my-learning">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start px-4 ${location === "/my-learning" ? "bg-gray-100 text-primary" : ""}`}
                    >
                      <ChartBarStacked className="h-5 w-5 mr-3" />
                      My Learning
                    </Button>
                  </Link>
                </SheetClose>
              )}
              
              <Button variant="ghost" className="w-full justify-start px-4">
                <Calendar className="h-5 w-5 mr-3" />
                Calendar
              </Button>
              
              <Button variant="ghost" className="w-full justify-start px-4">
                <MessageSquare className="h-5 w-5 mr-3" />
                Messages
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start px-4">
                <BookOpen className="h-5 w-5 mr-3" />
                Resources
              </Button>
              
              {user.role === "instructor" && (
                <SheetClose asChild>
                  <Link href="/instructor/dashboard">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start px-4 ${location.startsWith("/instructor") ? "bg-gray-100 text-primary" : ""}`}
                    >
                      <ChartBarStacked className="h-5 w-5 mr-3" />
                      Instructor Dashboard
                    </Button>
                  </Link>
                </SheetClose>
              )}
            </>
          )}
          
          <div className="px-3 pt-5 pb-2">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
          </div>
          
          <SheetClose asChild>
            <Link href="/courses?category=programming">
              <Button variant="ghost" className="w-full justify-between px-4">
                <span className="flex items-center">
                  <Code className="h-5 w-5 mr-3" />
                  Programming
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/courses?category=data-science">
              <Button variant="ghost" className="w-full justify-between px-4">
                <span className="flex items-center">
                  <ChartPie className="h-5 w-5 mr-3" />
                  Data Science
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/courses?category=design">
              <Button variant="ghost" className="w-full justify-between px-4">
                <span className="flex items-center">
                  <Palette className="h-5 w-5 mr-3" />
                  Design
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </SheetClose>
          
          <SheetClose asChild>
            <Link href="/courses?category=business">
              <Button variant="ghost" className="w-full justify-between px-4">
                <span className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-3" />
                  Business
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </SheetClose>
          
          {user ? (
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          ) : (
            <SheetClose asChild>
              <Link href="/auth">
                <Button className="mx-4 w-[calc(100%-32px)] mt-4">
                  Sign In
                </Button>
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
