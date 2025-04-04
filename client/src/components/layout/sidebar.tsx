import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  Award,
  ChevronRight,
  ChevronDown,
  Code,
  ChartBar,
  Palette,
  Briefcase,
  MoreHorizontal,
  Files,
  FileText,
  GraduationCap,
  BookOpenCheck
} from "lucide-react";

interface CategoryItem {
  name: string;
  icon: React.ReactNode;
  subcategories?: string[];
}

const categories: CategoryItem[] = [
  {
    name: "Programming",
    icon: <Code className="w-5 h-5" />,
    subcategories: ["Web Development", "Mobile Apps", "Data Structures"]
  },
  {
    name: "Data Science",
    icon: <ChartBar className="w-5 h-5" />
  },
  {
    name: "Design",
    icon: <Palette className="w-5 h-5" />
  },
  {
    name: "Business",
    icon: <Briefcase className="w-5 h-5" />
  }
];

export default function Sidebar() {
  const [expandedCategory, setExpandedCategory] = useState("Programming");
  const [location] = useLocation();

  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory("");
    } else {
      setExpandedCategory(categoryName);
    }
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 overflow-y-auto h-screen sticky top-16">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-1">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main Navigation
          </h2>
          
          <Link 
            href="/"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location === "/" ? "bg-gray-100 text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <Home className="w-5 h-5 mr-2" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            href="/my-learning"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location === "/my-learning" ? "bg-gray-100 text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            <span>My Courses</span>
          </Link>
          
          <Link 
            href="/calendar"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location === "/calendar" ? "bg-gray-100 text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            <span>Calendar</span>
          </Link>
          
          <Link 
            href="/messages"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location === "/messages" ? "bg-gray-100 text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            <span>Messages</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
          </Link>
          
          <div className="space-y-1">
            <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700">
              <Files className="w-5 h-5 mr-2" />
              <span>Resources</span>
            </div>
            
            <div className="pl-8 space-y-1">
              <Link 
                href="/student-resources"
                className={`block px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary ${
                  location === "/student-resources" ? "bg-gray-100 text-primary" : ""
                }`}
              >
                <div className="flex items-center">
                  <BookOpenCheck className="w-4 h-4 mr-2" />
                  <span>For Students</span>
                </div>
              </Link>
              
              <Link 
                href="/instructor-resources"
                className={`block px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary ${
                  location === "/instructor-resources" ? "bg-gray-100 text-primary" : ""
                }`}
              >
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <span>For Instructors</span>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="pt-4">
            <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Categories
            </h2>
            
            {categories.map((category) => (
              <div key={category.name} className="space-y-1">
                <button 
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary"
                  onClick={() => toggleCategory(category.name)}
                >
                  <span className="flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </span>
                  {expandedCategory === category.name ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedCategory === category.name && category.subcategories && (
                  <div className="pl-8 space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <Link 
                        key={subcategory} 
                        href={`/courses?category=${category.name.toLowerCase()}&subcategory=${subcategory.toLowerCase()}`}
                        className="block px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-primary"
                      >
                        {subcategory}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <Link 
              href="/course-categories"
              className={`mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                location === "/course-categories" ? "bg-gray-100 text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              <MoreHorizontal className="w-5 h-5 mr-2" />
              <span>View All Categories</span>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
