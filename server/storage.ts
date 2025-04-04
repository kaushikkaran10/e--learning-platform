import session from "express-session";
import createMemoryStore from "memorystore";
import { 
  users, 
  courses, 
  sections, 
  lectures, 
  enrollments, 
  lectureProgress, 
  reviews,
  type User, 
  type InsertUser, 
  type Course, 
  type InsertCourse,
  type Section,
  type InsertSection,
  type Lecture,
  type InsertLecture,
  type Enrollment,
  type InsertEnrollment,
  type LectureProgress,
  type InsertLectureProgress,
  type Review,
  type InsertReview
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(options?: { category?: string, search?: string, instructorId?: number }): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  
  // Section methods
  getSectionsByCourseId(courseId: number): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  
  // Lecture methods
  getLecturesBySectionId(sectionId: number): Promise<Lecture[]>;
  getLecture(id: number): Promise<Lecture | undefined>;
  createLecture(lecture: InsertLecture): Promise<Lecture>;
  
  // Enrollment methods
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrollmentById(id: number): Promise<Enrollment | undefined>;
  getEnrollmentsByUserId(userId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment | undefined>;
  
  // Progress tracking
  getLectureProgress(enrollmentId: number, lectureId: number): Promise<LectureProgress | undefined>;
  createLectureProgress(progress: InsertLectureProgress): Promise<LectureProgress>;
  updateLectureProgress(id: number, completed: boolean): Promise<LectureProgress | undefined>;
  
  // Reviews
  getReviewsByCourseId(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Implementation with in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private sections: Map<number, Section>;
  private lectures: Map<number, Lecture>;
  private enrollments: Map<number, Enrollment>;
  private lectureProgress: Map<number, LectureProgress>;
  private reviews: Map<number, Review>;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private sectionIdCounter: number;
  private lectureIdCounter: number;
  private enrollmentIdCounter: number;
  private lectureProgressIdCounter: number;
  private reviewIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.sections = new Map();
    this.lectures = new Map();
    this.enrollments = new Map();
    this.lectureProgress = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.sectionIdCounter = 1;
    this.lectureIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.lectureProgressIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Init with sample data (just creating the initial admin/instructor)
    this.createUser({
      username: "instructor",
      password: "password_hash_placeholder", // Will be hashed by auth service
      email: "instructor@example.com",
      fullName: "Demo Instructor",
      role: "instructor"
    });
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
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCourses(options?: { category?: string, search?: string, instructorId?: number }): Promise<Course[]> {
    let courses = Array.from(this.courses.values());
    
    if (options) {
      if (options.category) {
        courses = courses.filter(course => course.category === options.category);
      }
      
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        courses = courses.filter(course => 
          course.title.toLowerCase().includes(searchTerm) || 
          course.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (options.instructorId) {
        courses = courses.filter(course => course.instructorId === options.instructorId);
      }
    }
    
    return courses;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const now = new Date();
    const course: Course = { 
      ...insertCourse, 
      id, 
      createdAt: now,
      rating: 0,
      reviewCount: 0
    };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...courseData };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  // Section methods
  async getSectionsByCourseId(courseId: number): Promise<Section[]> {
    return Array.from(this.sections.values())
      .filter(section => section.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createSection(insertSection: InsertSection): Promise<Section> {
    const id = this.sectionIdCounter++;
    const section: Section = { ...insertSection, id };
    this.sections.set(id, section);
    return section;
  }
  
  // Lecture methods
  async getLecturesBySectionId(sectionId: number): Promise<Lecture[]> {
    return Array.from(this.lectures.values())
      .filter(lecture => lecture.sectionId === sectionId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getLecture(id: number): Promise<Lecture | undefined> {
    return this.lectures.get(id);
  }
  
  async createLecture(insertLecture: InsertLecture): Promise<Lecture> {
    const id = this.lectureIdCounter++;
    const lecture: Lecture = { ...insertLecture, id };
    this.lectures.set(id, lecture);
    return lecture;
  }
  
  // Enrollment methods
  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    );
  }
  
  async getEnrollmentById(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }
  
  async getEnrollmentsByUserId(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.userId === userId);
  }
  
  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const now = new Date();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id, 
      progress: 0, 
      enrolledAt: now 
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }
  
  async updateEnrollmentProgress(id: number, progress: number): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment = { ...enrollment, progress };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }
  
  // Progress tracking
  async getLectureProgress(enrollmentId: number, lectureId: number): Promise<LectureProgress | undefined> {
    return Array.from(this.lectureProgress.values()).find(
      progress => progress.enrollmentId === enrollmentId && progress.lectureId === lectureId
    );
  }
  
  async createLectureProgress(insertProgress: InsertLectureProgress): Promise<LectureProgress> {
    const id = this.lectureProgressIdCounter++;
    const now = new Date();
    const progress: LectureProgress = { 
      ...insertProgress, 
      id, 
      lastAccessed: now 
    };
    this.lectureProgress.set(id, progress);
    return progress;
  }
  
  async updateLectureProgress(id: number, completed: boolean): Promise<LectureProgress | undefined> {
    const progress = this.lectureProgress.get(id);
    if (!progress) return undefined;
    
    const now = new Date();
    const updatedProgress = { 
      ...progress, 
      completed, 
      lastAccessed: now 
    };
    this.lectureProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  // Reviews
  async getReviewsByCourseId(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.courseId === courseId);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now 
    };
    this.reviews.set(id, review);
    
    // Update course rating
    const course = this.courses.get(insertReview.courseId);
    if (course) {
      const reviews = await this.getReviewsByCourseId(course.id);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const newRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      await this.updateCourse(course.id, {
        rating: parseFloat(newRating.toFixed(1)),
        reviewCount: reviews.length
      });
    }
    
    return review;
  }
}

export const storage = new MemStorage();
