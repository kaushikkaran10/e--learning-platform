import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const categories = [
  { name: "Programming", subcategories: ["Web Development", "Mobile Apps", "Data Structures"] },
  { name: "Data Science", subcategories: ["Machine Learning", "Data Analysis", "Visualization"] },
  { name: "Design", subcategories: ["UI/UX", "Graphic Design", "Animation"] },
  { name: "Business", subcategories: ["Marketing", "Finance", "Entrepreneurship"] },
];

const levels = ["Beginner", "Intermediate", "Advanced", "All levels"];

interface CourseFilterProps {
  onFilterChange: (filters: any) => void;
}

export default function CourseFilter({ onFilterChange }: CourseFilterProps) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState(params.get("subcategory") || "all-subcategories");
  const [selectedLevel, setSelectedLevel] = useState(params.get("level") || "all-levels");
  const [freeOnly, setFreeOnly] = useState(params.get("free") === "true");

  // Get subcategories for selected category
  const getSubcategories = () => {
    const category = categories.find(cat => cat.name === selectedCategory);
    return category ? category.subcategories : [];
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    applyFilters();
  };

  const applyFilters = () => {
    const filters: Record<string, string | boolean> = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (selectedCategory && selectedCategory !== "all") filters.category = selectedCategory;
    if (selectedSubcategory && selectedSubcategory !== "all-subcategories") filters.subcategory = selectedSubcategory;
    if (selectedLevel && selectedLevel !== "all-levels") filters.level = selectedLevel;
    if (freeOnly) filters.free = true;
    
    onFilterChange(filters);
    
    // Update URL with filter parameters
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    if (selectedCategory && selectedCategory !== "all") queryParams.set("category", selectedCategory);
    if (selectedSubcategory && selectedSubcategory !== "all-subcategories") queryParams.set("subcategory", selectedSubcategory);
    if (selectedLevel && selectedLevel !== "all-levels") queryParams.set("level", selectedLevel);
    if (freeOnly) queryParams.set("free", "true");
    
    setLocation(`/courses?${queryParams.toString()}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSubcategory("all-subcategories");
    setSelectedLevel("all-levels");
    setFreeOnly(false);
    
    onFilterChange({});
    setLocation("/courses");
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filter Courses</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="flex mt-1">
            <Input 
              id="search"
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-r-none flex-1"
            />
            <Button type="submit" className="rounded-l-none">
              Search
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category" className="mt-1">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCategory && selectedCategory !== "all" && (
          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger id="subcategory" className="mt-1">
                <SelectValue placeholder="All Subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-subcategories">All Subcategories</SelectItem>
                {getSubcategories().map(subcategory => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger id="level" className="mt-1">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-levels">All Levels</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="free-only" 
            checked={freeOnly} 
            onCheckedChange={(checked) => setFreeOnly(checked as boolean)}
          />
          <Label htmlFor="free-only">Free courses only</Label>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button type="button" onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button 
            type="button" 
            onClick={resetFilters} 
            variant="outline" 
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
