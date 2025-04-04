import { Link } from "wouter";
import { Code, ChartPie, Palette, Briefcase, Camera, Languages } from "lucide-react";

interface Category {
  name: string;
  icon: React.ReactNode;
  courseCount: number;
  colorClass: string;
  hoverColorClass: string;
  link: string;
}

const categories: Category[] = [
  {
    name: "Programming",
    icon: <Code className="text-xl" />,
    courseCount: 845,
    colorClass: "bg-blue-100 text-primary",
    hoverColorClass: "group-hover:bg-primary",
    link: "/courses?category=programming"
  },
  {
    name: "Data Science",
    icon: <ChartPie className="text-xl" />,
    courseCount: 412,
    colorClass: "bg-green-100 text-green-600",
    hoverColorClass: "group-hover:bg-green-500",
    link: "/courses?category=data-science"
  },
  {
    name: "Design",
    icon: <Palette className="text-xl" />,
    courseCount: 326,
    colorClass: "bg-purple-100 text-purple-600",
    hoverColorClass: "group-hover:bg-purple-500",
    link: "/courses?category=design"
  },
  {
    name: "Business",
    icon: <Briefcase className="text-xl" />,
    courseCount: 528,
    colorClass: "bg-yellow-100 text-yellow-600",
    hoverColorClass: "group-hover:bg-yellow-500",
    link: "/courses?category=business"
  },
  {
    name: "Photography",
    icon: <Camera className="text-xl" />,
    courseCount: 143,
    colorClass: "bg-red-100 text-red-500",
    hoverColorClass: "group-hover:bg-red-500",
    link: "/courses?category=photography"
  },
  {
    name: "Languages",
    icon: <Languages className="text-xl" />,
    courseCount: 259,
    colorClass: "bg-teal-100 text-teal-500",
    hoverColorClass: "group-hover:bg-teal-500",
    link: "/courses?category=languages"
  }
];

export default function FeaturedCategories() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Categories</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {categories.map((category, index) => (
          <Link key={index} href={category.link}>
            <a className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-4 text-center">
              <div className={`h-12 w-12 ${category.colorClass} rounded-lg mx-auto flex items-center justify-center mb-3 ${category.hoverColorClass} group-hover:text-white transition-colors`}>
                {category.icon}
              </div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.courseCount} courses</p>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
