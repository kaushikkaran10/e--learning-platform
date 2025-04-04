import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(params.get("subcategory") || "");
  const [selectedLevel, setSelectedLevel] = useState(params.get("level") || "");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);
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
    const filters: Record<string, string | boolean | number[]> = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedSubcategory) filters.subcategory = selectedSubcategory;
    if (selectedLevel) filters.level = selectedLevel;
    if (freeOnly) filters.free = true;
    filters.priceRange = priceRange;
    
    onFilterChange(filters);
    
    // Update URL with filter parameters
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("search", searchTerm);
    if (selectedCategory) queryParams.set("category", selectedCategory);
    if (selectedSubcategory) queryParams.set("subcategory", selectedSubcategory);
    if (selectedLevel) queryParams.set("level", selectedLevel);
    if (freeOnly) queryParams.set("free", "true");
    
    setLocation(`/courses?${queryParams.toString()}`);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedLevel("");
    setPriceRange([0, 100]);
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
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCategory && (
          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger id="subcategory" className="mt-1">
                <SelectValue placeholder="All Subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subcategories</SelectItem>
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
              <SelectItem value="">All Levels</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Price Range</Label>
          <div className="mt-6 px-2">
            <Slider
              value={priceRange}
              min={0}
              max={100}
              step={5}
              onValueChange={setPriceRange}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
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
