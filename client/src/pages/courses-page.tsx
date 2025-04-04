import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { CourseCard } from "@/components/course-card";
import { Category, Course, User } from "@shared/schema";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";

export default function CoursesPage() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams>();
  const [categoryFilter, setCategoryFilter] = useState<number>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    
    if (params.has("category")) {
      setCategoryFilter(parseInt(params.get("category") || "0"));
    }
    
    if (params.has("search")) {
      setSearchQuery(params.get("search") || "");
    }
  }, [location]);
  
  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Construct the query URL based on filters
  const getCoursesUrl = () => {
    if (categoryFilter) {
      return `/api/courses?category=${categoryFilter}`;
    }
    if (searchQuery) {
      return `/api/courses?search=${encodeURIComponent(searchQuery)}`;
    }
    return "/api/courses";
  };
  
  // Fetch filtered courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses,
    refetch
  } = useQuery<Course[]>({
    queryKey: [getCoursesUrl()],
  });
  
  // Fetch instructors
  const { data: instructors, isLoading: isLoadingInstructors } = useQuery<User[]>({
    queryKey: ["/api/instructors"],
    enabled: !!courses,
  });
  
  // Find instructor by ID
  const getInstructor = (instructorId: number) => {
    return instructors?.find(instructor => instructor.id === instructorId);
  };
  
  // Get category name by ID
  const getCategoryName = (id: number) => {
    return categories?.find(cat => cat.id === id)?.name || "Unknown";
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  // Handle category filter change
  const handleCategoryChange = (categoryId: number) => {
    setCategoryFilter(categoryId);
    window.location.href = `/courses?category=${categoryId}`;
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setCategoryFilter(undefined);
    setSearchQuery("");
    window.location.href = "/courses";
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Course Catalog</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4">Search</h2>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              <button type="submit" className="sr-only">Search</button>
            </form>
            
            <h2 className="font-bold text-lg mb-4">Categories</h2>
            {isLoadingCategories ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {categories?.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category.id}`}
                      name="category"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      checked={categoryFilter === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            {(categoryFilter || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="mt-6 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Courses grid */}
        <div className="lg:col-span-3">
          {categoryFilter && categories && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{getCategoryName(categoryFilter)} Courses</h2>
              <p className="text-gray-600 mt-1">Showing courses in {getCategoryName(categoryFilter)}</p>
            </div>
          )}
          
          {searchQuery && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Search Results</h2>
              <p className="text-gray-600 mt-1">Results for "{searchQuery}"</p>
            </div>
          )}
          
          {isLoadingCourses || isLoadingInstructors ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : courses?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-xl font-medium mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={handleClearFilters}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses?.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  instructor={getInstructor(course.instructorId)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
