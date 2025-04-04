import { Brain, Code, Database, Lock, Server, Globe, Smartphone, Cog, Command, ChevronRight, BarChart, LineChart, Network, Cpu } from "lucide-react";
import { Link } from "wouter";
import PageLayout from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CourseCategories() {
  return (
    <PageLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Course Categories</h1>
          <p className="text-muted-foreground text-lg">
            Explore our wide range of course categories to find your next learning opportunity.
          </p>
        </div>

        <div className="space-y-12">
          {/* PROGRAMMING CATEGORY */}
          <section>
            <div className="flex items-center mb-6">
              <Code className="h-7 w-7 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Programming</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CategoryCard 
                icon={<Globe className="h-10 w-10 text-primary" />}
                title="Web Development" 
                description="Master the art of building responsive and dynamic websites using modern technologies."
                courseCount={42}
                subcategories={['Frontend', 'Backend', 'Full Stack', 'JavaScript', 'React', 'Node.js']}
                path="/courses?category=web-development"
              />
              
              <CategoryCard 
                icon={<Smartphone className="h-10 w-10 text-primary" />}
                title="Mobile App Development" 
                description="Create powerful applications for iOS and Android platforms."
                courseCount={36}
                subcategories={['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin']}
                path="/courses?category=mobile-development"
              />
              
              <CategoryCard 
                icon={<Command className="h-10 w-10 text-primary" />}
                title="Data Structures & Algorithms" 
                description="Build a strong foundation in computer science principles and problem-solving."
                courseCount={28}
                subcategories={['Algorithms', 'Data Structures', 'Problem Solving', 'Competitive Programming']}
                path="/courses?category=algorithms"
              />
              
              <CategoryCard 
                icon={<Lock className="h-10 w-10 text-primary" />}
                title="Cybersecurity" 
                description="Learn to identify vulnerabilities and protect systems from threats."
                courseCount={22}
                subcategories={['Network Security', 'Ethical Hacking', 'Security Analysis', 'Cryptography']}
                path="/courses?category=cybersecurity"
              />
              
              <CategoryCard 
                icon={<Server className="h-10 w-10 text-primary" />}
                title="DevOps & Cloud Computing" 
                description="Master the tools and practices for efficient software development and deployment."
                courseCount={19}
                subcategories={['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD']}
                path="/courses?category=devops"
              />
              
              <CategoryCard 
                icon={<Cog className="h-10 w-10 text-primary" />}
                title="Software Engineering" 
                description="Learn best practices for creating robust, scalable, and maintainable software."
                courseCount={31}
                subcategories={['Software Design', 'Testing', 'Project Management', 'Agile']}
                path="/courses?category=software-engineering"
              />
            </div>
          </section>

          {/* DATA SCIENCE & AI CATEGORY */}
          <section>
            <div className="flex items-center mb-6">
              <Brain className="h-7 w-7 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Data Science & AI</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CategoryCard 
                icon={<Brain className="h-10 w-10 text-primary" />}
                title="Machine Learning" 
                description="Learn to create systems that can learn from data and make intelligent decisions."
                courseCount={38}
                subcategories={['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Python for ML']}
                path="/courses?category=machine-learning"
              />
              
              <CategoryCard 
                icon={<Network className="h-10 w-10 text-primary" />}
                title="Deep Learning" 
                description="Master neural networks and their applications in computer vision, NLP, and more."
                courseCount={26}
                subcategories={['Neural Networks', 'Computer Vision', 'NLP', 'TensorFlow', 'PyTorch']}
                path="/courses?category=deep-learning"
              />
              
              <CategoryCard 
                icon={<BarChart className="h-10 w-10 text-primary" />}
                title="Data Analysis" 
                description="Transform raw data into actionable insights using statistical methods and tools."
                courseCount={32}
                subcategories={['Data Visualization', 'Statistical Analysis', 'R Programming', 'Python Data Science']}
                path="/courses?category=data-analysis"
              />
              
              <CategoryCard 
                icon={<Database className="h-10 w-10 text-primary" />}
                title="Big Data" 
                description="Analyze and process massive datasets with specialized tools and frameworks."
                courseCount={21}
                subcategories={['Hadoop', 'Spark', 'NoSQL', 'Data Warehousing', 'ETL']}
                path="/courses?category=big-data"
              />
              
              <CategoryCard 
                icon={<LineChart className="h-10 w-10 text-primary" />}
                title="Predictive Analytics" 
                description="Use historical data to forecast trends and make data-driven predictions."
                courseCount={19}
                subcategories={['Forecasting', 'Risk Analysis', 'Business Intelligence', 'Regression Modeling']}
                path="/courses?category=predictive-analytics"
              />
              
              <CategoryCard 
                icon={<Cpu className="h-10 w-10 text-primary" />}
                title="AI Applications" 
                description="Apply artificial intelligence to solve real-world problems across industries."
                courseCount={24}
                subcategories={['AI in Healthcare', 'AI in Finance', 'Robotics', 'Natural Language Processing']}
                path="/courses?category=ai-applications"
              />
            </div>
          </section>

          {/* Add other categories as needed */}
        </div>
      </div>
    </PageLayout>
  );
}

function CategoryCard({ 
  icon, 
  title, 
  description, 
  courseCount, 
  subcategories, 
  path 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  courseCount: number;
  subcategories: string[];
  path: string;
}) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex-grow">
        <p className="text-sm text-muted-foreground mb-3">{courseCount} courses available</p>
        <div className="flex flex-wrap gap-2">
          {subcategories.slice(0, 4).map((subcategory, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {subcategory}
            </Badge>
          ))}
          {subcategories.length > 4 && (
            <Badge variant="outline" className="font-normal">
              +{subcategories.length - 4} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={path}>
          <div className="w-full text-primary hover:text-primary-dark font-medium flex items-center justify-between cursor-pointer text-sm">
            Explore Courses
            <ChevronRight className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}