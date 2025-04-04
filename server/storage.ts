import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  courses, type Course, type InsertCourse,
  sections, type Section, type InsertSection,
  lectures, type Lecture, type InsertLecture,
  enrollments, type Enrollment, type InsertEnrollment,
  progress, type Progress, type InsertProgress,
  reviews, type Review, type InsertReview,
  testimonials, type Testimonial, type InsertTestimonial
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllInstructors(): Promise<User[]>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Courses
  getAllCourses(): Promise<Course[]>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;
  getCoursesByInstructor(instructorId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  searchCourses(query: string): Promise<Course[]>;
  
  // Sections
  getSectionsByCourse(courseId: number): Promise<Section[]>;
  getSection(id: number): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  
  // Lectures
  getLecturesBySection(sectionId: number): Promise<Lecture[]>;
  getLecture(id: number): Promise<Lecture | undefined>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  
  // Enrollments
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentByCourseAndUser(courseId: number, userId: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Promise<Enrollment | undefined>;
  
  // Progress
  getProgressByUserAndLecture(userId: number, lectureId: number): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(id: number, progress: Partial<Progress>): Promise<Progress | undefined>;
  
  // Reviews
  getReviewsByCourse(courseId: number): Promise<Review[]>;
  getReviewByUserAndCourse(userId: number, courseId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Testimonials
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Session store
  sessionStore: session.Store;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private courses: Map<number, Course>;
  private sections: Map<number, Section>;
  private lectures: Map<number, Lecture>;
  private enrollments: Map<number, Enrollment>;
  private progress: Map<number, Progress>;
  private reviews: Map<number, Review>;
  private testimonials: Map<number, Testimonial>;
  
  private userId: number;
  private categoryId: number;
  private courseId: number;
  private sectionId: number;
  private lectureId: number;
  private enrollmentId: number;
  private progressId: number;
  private reviewId: number;
  private testimonialId: number;
  
  sessionStore: session.Store;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.sections = new Map();
    this.lectures = new Map();
    this.enrollments = new Map();
    this.progress = new Map();
    this.reviews = new Map();
    this.testimonials = new Map();
    
    // Initialize IDs
    this.userId = 1;
    this.categoryId = 1;
    this.courseId = 1;
    this.sectionId = 1;
    this.lectureId = 1;
    this.enrollmentId = 1;
    this.progressId = 1;
    this.reviewId = 1;
    this.testimonialId = 1;

    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Seed some data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllInstructors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "instructor"
    );
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.categoryId === categoryId
    );
  }

  async getCoursesByInstructor(instructorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.instructorId === instructorId
    );
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const course: Course = {
      ...insertCourse,
      id,
      totalStudents: 0,
      averageRating: 0,
      ratingCount: 0
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseUpdate: Partial<Course>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;
    
    const updatedCourse = { ...existingCourse, ...courseUpdate };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async searchCourses(query: string): Promise<Course[]> {
    const lowerCaseQuery = query.toLowerCase();
    return Array.from(this.courses.values()).filter(
      (course) => course.title.toLowerCase().includes(lowerCaseQuery) ||
                  course.description.toLowerCase().includes(lowerCaseQuery)
    );
  }

  // Section methods
  async getSectionsByCourse(courseId: number): Promise<Section[]> {
    return Array.from(this.sections.values())
      .filter((section) => section.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getSection(id: number): Promise<Section | undefined> {
    return this.sections.get(id);
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const id = this.sectionId++;
    const section: Section = { ...insertSection, id };
    this.sections.set(id, section);
    return section;
  }

  // Lecture methods
  async getLecturesBySection(sectionId: number): Promise<Lecture[]> {
    return Array.from(this.lectures.values())
      .filter((lecture) => lecture.sectionId === sectionId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getLecture(id: number): Promise<Lecture | undefined> {
    return this.lectures.get(id);
  }

  async createLecture(insertLecture: InsertLecture): Promise<Lecture> {
    const id = this.lectureId++;
    const lecture: Lecture = { ...insertLecture, id };
    this.lectures.set(id, lecture);
    return lecture;
  }

  // Enrollment methods
  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId
    );
  }

  async getEnrollmentByCourseAndUser(courseId: number, userId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      (enrollment) => enrollment.courseId === courseId && enrollment.userId === userId
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentId++;
    const enrollment: Enrollment = {
      ...insertEnrollment,
      id,
      enrollmentDate: new Date(),
      completed: false,
      progressPercent: 0
    };
    this.enrollments.set(id, enrollment);
    
    // Update course enrollment count
    const course = this.courses.get(enrollment.courseId);
    if (course) {
      this.courses.set(course.id, {
        ...course,
        totalStudents: course.totalStudents + 1
      });
    }
    
    return enrollment;
  }

  async updateEnrollment(id: number, enrollmentUpdate: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const existingEnrollment = this.enrollments.get(id);
    if (!existingEnrollment) return undefined;
    
    const updatedEnrollment = { ...existingEnrollment, ...enrollmentUpdate };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Progress methods
  async getProgressByUserAndLecture(userId: number, lectureId: number): Promise<Progress | undefined> {
    return Array.from(this.progress.values()).find(
      (p) => p.userId === userId && p.lectureId === lectureId
    );
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.progressId++;
    const progress: Progress = {
      ...insertProgress,
      id,
      completed: false,
      lastWatchedPosition: 0,
      lastWatchedDate: new Date()
    };
    this.progress.set(id, progress);
    return progress;
  }

  async updateProgress(id: number, progressUpdate: Partial<Progress>): Promise<Progress | undefined> {
    const existingProgress = this.progress.get(id);
    if (!existingProgress) return undefined;
    
    const updatedProgress = {
      ...existingProgress,
      ...progressUpdate,
      lastWatchedDate: new Date()
    };
    this.progress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Review methods
  async getReviewsByCourse(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.courseId === courseId
    );
  }

  async getReviewByUserAndCourse(userId: number, courseId: number): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.userId === userId && review.courseId === courseId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    
    // Update course rating
    const course = this.courses.get(review.courseId);
    if (course) {
      const newRatingCount = course.ratingCount + 1;
      const newAverageRating = (course.averageRating * course.ratingCount + review.rating) / newRatingCount;
      
      this.courses.set(course.id, {
        ...course,
        averageRating: Number(newAverageRating.toFixed(1)),
        ratingCount: newRatingCount
      });
    }
    
    return review;
  }

  // Testimonial methods
  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(
      (testimonial) => testimonial.featured
    );
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Helper method to seed initial data
  private seedData() {
    // Categories
    const programming: Category = {
      id: this.categoryId++,
      name: "Programming",
      description: "Learn to code and build applications",
      iconClass: "fa-code",
      bgColor: "bg-primary/10",
      textColor: "text-primary"
    };
    this.categories.set(programming.id, programming);
    
    const dataScience: Category = {
      id: this.categoryId++,
      name: "Data Science",
      description: "Analyze data and build machine learning models",
      iconClass: "fa-chart-pie",
      bgColor: "bg-secondary/10",
      textColor: "text-secondary"
    };
    this.categories.set(dataScience.id, dataScience);
    
    const design: Category = {
      id: this.categoryId++,
      name: "Design",
      description: "Create beautiful user interfaces and experiences",
      iconClass: "fa-paint-brush",
      bgColor: "bg-accent/10",
      textColor: "text-accent"
    };
    this.categories.set(design.id, design);
    
    const business: Category = {
      id: this.categoryId++,
      name: "Business",
      description: "Develop business skills and knowledge",
      iconClass: "fa-briefcase",
      bgColor: "bg-success/10",
      textColor: "text-success"
    };
    this.categories.set(business.id, business);
    
    const languages: Category = {
      id: this.categoryId++,
      name: "Languages",
      description: "Learn new languages and cultures",
      iconClass: "fa-language",
      bgColor: "bg-warning/10",
      textColor: "text-warning"
    };
    this.categories.set(languages.id, languages);
    
    const science: Category = {
      id: this.categoryId++,
      name: "Science",
      description: "Discover scientific principles and methods",
      iconClass: "fa-flask",
      bgColor: "bg-error/10",
      textColor: "text-error"
    };
    this.categories.set(science.id, science);

    // Instructors
    const johnDavis: User = {
      id: this.userId++,
      username: "johndavis",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "John Davis",
      email: "john@example.com",
      bio: "Full Stack Developer & Educational Mentor with over 10 years of experience",
      role: "instructor",
      avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5"
    };
    this.users.set(johnDavis.id, johnDavis);
    
    const emilyChen: User = {
      id: this.userId++,
      username: "emilychen",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "Emily Chen",
      email: "emily@example.com",
      bio: "Data Scientist with a PhD in Machine Learning",
      role: "instructor",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956"
    };
    this.users.set(emilyChen.id, emilyChen);
    
    const michaelTorres: User = {
      id: this.userId++,
      username: "michaeltorres",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "Michael Torres",
      email: "michael@example.com",
      bio: "UX/UI Designer with experience at top tech companies",
      role: "instructor",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    };
    this.users.set(michaelTorres.id, michaelTorres);
    
    const sarahJohnson: User = {
      id: this.userId++,
      username: "sarahjohnson",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "Sarah Johnson",
      email: "sarah@example.com",
      bio: "Digital Marketing Strategist and Former Marketing Director",
      role: "instructor",
      avatarUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4"
    };
    this.users.set(sarahJohnson.id, sarahJohnson);

    // Sample student
    const aliceWong: User = {
      id: this.userId++,
      username: "alicewong",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "Alicia Wong",
      email: "alice@example.com",
      bio: "Software engineering student",
      role: "student",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    };
    this.users.set(aliceWong.id, aliceWong);
    
    const robertSmith: User = {
      id: this.userId++,
      username: "robertsmith",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "Robert Smith",
      email: "robert@example.com",
      bio: "Aspiring UX designer",
      role: "student",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"
    };
    this.users.set(robertSmith.id, robertSmith);
    
    const jenniferParker: User = {
      id: this.userId++,
      username: "jenniferparker",
      password: "$argon2id$v=19$m=65536,t=3,p=4$aBRfFXURfw9Uii/SQXVYrg$UYncXGQ9H12e7ZvbO4d9Q1lQfFcQ6PwftmGtYzGQ4lc", // password
      name: "Jennifer Parker",
      email: "jennifer@example.com",
      bio: "Data science enthusiast",
      role: "student",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
    };
    this.users.set(jenniferParker.id, jenniferParker);

    // Courses
    const webDevCourse: Course = {
      id: this.courseId++,
      title: "Full Stack Web Development with React and Node.js",
      description: "Learn to build complete web applications from scratch using the most popular JavaScript frameworks and technologies.",
      instructorId: johnDavis.id,
      categoryId: programming.id,
      price: 49.99,
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      level: "Beginner",
      durationHours: 20,
      totalStudents: 3245,
      averageRating: 4.5,
      ratingCount: 345
    };
    this.courses.set(webDevCourse.id, webDevCourse);
    
    const dataScienceCourse: Course = {
      id: this.courseId++,
      title: "Python for Data Science and Machine Learning",
      description: "Comprehensive guide to using Python for data analysis, visualization, and machine learning.",
      instructorId: emilyChen.id,
      categoryId: dataScience.id,
      price: 59.99,
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      level: "Intermediate",
      durationHours: 15,
      totalStudents: 2189,
      averageRating: 5.0,
      ratingCount: 287
    };
    this.courses.set(dataScienceCourse.id, dataScienceCourse);
    
    const uiUxCourse: Course = {
      id: this.courseId++,
      title: "UI/UX Design Fundamentals: Create Stunning Interfaces",
      description: "Master the principles of effective user interface and experience design with practical projects.",
      instructorId: michaelTorres.id,
      categoryId: design.id,
      price: 39.99,
      thumbnailUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12",
      level: "All Levels",
      durationHours: 12,
      totalStudents: 1876,
      averageRating: 4.2,
      ratingCount: 203
    };
    this.courses.set(uiUxCourse.id, uiUxCourse);
    
    const marketingCourse: Course = {
      id: this.courseId++,
      title: "Digital Marketing Strategy: Social Media & Content",
      description: "Develop effective digital marketing strategies for social media platforms and content creation.",
      instructorId: sarahJohnson.id,
      categoryId: business.id,
      price: 29.99,
      thumbnailUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740",
      level: "Beginner",
      durationHours: 8,
      totalStudents: 1543,
      averageRating: 4.6,
      ratingCount: 178
    };
    this.courses.set(marketingCourse.id, marketingCourse);

    // Sections (modules) for Web Development course
    const webDevIntro: Section = {
      id: this.sectionId++,
      courseId: webDevCourse.id,
      title: "Introduction to Web Development",
      description: "Learn the basics of web development and set up your environment",
      orderIndex: 1
    };
    this.sections.set(webDevIntro.id, webDevIntro);
    
    const reactFundamentals: Section = {
      id: this.sectionId++,
      courseId: webDevCourse.id,
      title: "React.js Fundamentals",
      description: "Master the basics of React.js including components, props, and state",
      orderIndex: 2
    };
    this.sections.set(reactFundamentals.id, reactFundamentals);
    
    const nodeExpress: Section = {
      id: this.sectionId++,
      courseId: webDevCourse.id,
      title: "Node.js and Express",
      description: "Build backend APIs with Node.js and Express",
      orderIndex: 3
    };
    this.sections.set(nodeExpress.id, nodeExpress);
    
    const mongoDB: Section = {
      id: this.sectionId++,
      courseId: webDevCourse.id,
      title: "MongoDB & Mongoose",
      description: "Connect your application to a MongoDB database using Mongoose",
      orderIndex: 4
    };
    this.sections.set(mongoDB.id, mongoDB);
    
    const authSecurity: Section = {
      id: this.sectionId++,
      courseId: webDevCourse.id,
      title: "Authentication & Authorization",
      description: "Implement user authentication and secure your application",
      orderIndex: 5
    };
    this.sections.set(authSecurity.id, authSecurity);

    // Lectures for Introduction to Web Development section
    const courseOverview: Lecture = {
      id: this.lectureId++,
      sectionId: webDevIntro.id,
      title: "Course Overview",
      description: "Overview of what you'll learn in this course",
      videoUrl: "https://example.com/videos/course-overview",
      duration: 615, // 10:15
      orderIndex: 1,
      lectureType: "video"
    };
    this.lectures.set(courseOverview.id, courseOverview);
    
    const devEnvironment: Lecture = {
      id: this.lectureId++,
      sectionId: webDevIntro.id,
      title: "Setting Up Your Development Environment",
      description: "Install and configure the necessary tools for web development",
      videoUrl: "https://example.com/videos/dev-environment",
      duration: 750, // 12:30
      orderIndex: 2,
      lectureType: "video"
    };
    this.lectures.set(devEnvironment.id, devEnvironment);
    
    const webFundamentals: Lecture = {
      id: this.lectureId++,
      sectionId: webDevIntro.id,
      title: "HTML, CSS and JavaScript Fundamentals",
      description: "Quick refresher on the core technologies of the web",
      videoUrl: "https://example.com/videos/web-fundamentals",
      duration: 945, // 15:45
      orderIndex: 3,
      lectureType: "video"
    };
    this.lectures.set(webFundamentals.id, webFundamentals);
    
    const webConceptsQuiz: Lecture = {
      id: this.lectureId++,
      sectionId: webDevIntro.id,
      title: "Basic Web Concepts Quiz",
      description: "Test your knowledge of basic web development concepts",
      videoUrl: null,
      duration: 600, // 10:00
      orderIndex: 4,
      lectureType: "quiz"
    };
    this.lectures.set(webConceptsQuiz.id, webConceptsQuiz);

    // Testimonials
    const aliceTestimonial: Testimonial = {
      id: this.testimonialId++,
      userId: aliceWong.id,
      text: "The web development course was exactly what I needed. The instructor explained complex concepts in an easy-to-understand way, and the projects helped reinforce my learning. I landed a job as a junior developer just 3 months after completing the course!",
      rating: 5,
      featured: true
    };
    this.testimonials.set(aliceTestimonial.id, aliceTestimonial);
    
    const robertTestimonial: Testimonial = {
      id: this.testimonialId++,
      userId: robertSmith.id,
      text: "The UI/UX design course completely transformed how I approach design problems. The instructor's feedback on my projects was invaluable. I've already recommended this platform to all my colleagues looking to upskill.",
      rating: 4,
      featured: true
    };
    this.testimonials.set(robertTestimonial.id, robertTestimonial);
    
    const jenniferTestimonial: Testimonial = {
      id: this.testimonialId++,
      userId: jenniferParker.id,
      text: "I was skeptical about online learning at first, but this platform changed my mind. The Python for Data Science course had the perfect balance of theory and practice. The community support was amazing too - I got help whenever I was stuck.",
      rating: 5,
      featured: true
    };
    this.testimonials.set(jenniferTestimonial.id, jenniferTestimonial);
  }
}

export const storage = new MemStorage();
