import { Category } from "@shared/schema";
import { Link } from "wouter";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/courses?category=${category.id}`}>
      <a className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className={`w-12 h-12 flex items-center justify-center ${category.bgColor} rounded-full mb-3`}>
          <i className={`fas ${category.iconClass} ${category.textColor} text-xl`}></i>
        </div>
        <span className="text-sm font-medium text-center">{category.name}</span>
      </a>
    </Link>
  );
}
