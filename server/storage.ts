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
  adminLogs,
  platformSettings,
  courseApprovals,
  assignments,
  submissions,
  quizQuestions,
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
  type InsertReview,
  type AdminLog,
  type InsertAdminLog,
  type PlatformSetting,
  type InsertPlatformSetting,
  type CourseApproval,
  type InsertCourseApproval,
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type QuizQuestion,
  type InsertQuizQuestion
} from "@shared/schema";

// Create a memory store type
const MemoryStore = createMemoryStore(session);
type MemoryStoreType = ReturnType<typeof createMemoryStore>;

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(role?: string): Promise<User[]>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(options?: { category?: string, search?: string, instructorId?: number, status?: string }): Promise<Course[]>;
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
  getAllEnrollments(): Promise<Enrollment[]>;
  
  // Progress tracking
  getLectureProgress(enrollmentId: number, lectureId: number): Promise<LectureProgress | undefined>;
  createLectureProgress(progress: InsertLectureProgress): Promise<LectureProgress>;
  updateLectureProgress(id: number, completed: boolean): Promise<LectureProgress | undefined>;
  
  // Reviews
  getReviewsByCourseId(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getAllReviews(): Promise<Review[]>;
  
  // Admin logs
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(adminId?: number, entityType?: string, entityId?: number): Promise<AdminLog[]>;
  
  // Platform settings
  getPlatformSetting(key: string): Promise<PlatformSetting | undefined>;
  getAllPlatformSettings(category?: string): Promise<PlatformSetting[]>;
  createOrUpdatePlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting>;
  
  // Course approvals
  getCourseApproval(courseId: number): Promise<CourseApproval | undefined>;
  createCourseApproval(approval: InsertCourseApproval): Promise<CourseApproval>;
  updateCourseApproval(courseId: number, data: Partial<CourseApproval>): Promise<CourseApproval | undefined>;
  getCourseApprovals(status?: string): Promise<CourseApproval[]>;
  
  // Assignment methods
  getAssignment(id: number): Promise<Assignment | undefined>;
  getAssignmentsByCourseId(courseId: number): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;
  
  // Submission methods
  getSubmission(id: number): Promise<Submission | undefined>;
  getUserSubmissionForAssignment(userId: number, assignmentId: number): Promise<Submission | undefined>;
  getSubmissionsByAssignmentId(assignmentId: number): Promise<Submission[]>;
  getSubmissionsByUserId(userId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: number, data: Partial<Submission>): Promise<Submission | undefined>;
  gradeSubmission(id: number, grade: number, feedback: string, gradedBy: number): Promise<Submission | undefined>;
  
  // Quiz question methods
  getQuizQuestion(id: number): Promise<QuizQuestion | undefined>;
  getQuizQuestionsByAssignmentId(assignmentId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuizQuestion(id: number, data: Partial<QuizQuestion>): Promise<QuizQuestion | undefined>;
  deleteQuizQuestion(id: number): Promise<boolean>;
  
  // Analytics
  getPlatformStats(): Promise<{
    totalUsers: number,
    totalCourses: number,
    totalEnrollments: number,
    totalReviews: number,
    averageRating: number
  }>;
  
  // Session store
  sessionStore: session.Store;
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
  private adminLogs: Map<number, AdminLog>;
  private platformSettings: Map<number, PlatformSetting>;
  private courseApprovals: Map<number, CourseApproval>;
  private assignments: Map<number, Assignment>;
  private submissions: Map<number, Submission>;
  private quizQuestions: Map<number, QuizQuestion>;
  
  private userIdCounter: number;
  private courseIdCounter: number;
  private sectionIdCounter: number;
  private lectureIdCounter: number;
  private enrollmentIdCounter: number;
  private lectureProgressIdCounter: number;
  private reviewIdCounter: number;
  private adminLogIdCounter: number;
  private platformSettingIdCounter: number;
  private courseApprovalIdCounter: number;
  private assignmentIdCounter: number;
  private submissionIdCounter: number;
  private quizQuestionIdCounter: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.sections = new Map();
    this.lectures = new Map();
    this.enrollments = new Map();
    this.lectureProgress = new Map();
    this.reviews = new Map();
    this.adminLogs = new Map();
    this.platformSettings = new Map();
    this.courseApprovals = new Map();
    this.assignments = new Map();
    this.submissions = new Map();
    this.quizQuestions = new Map();
    
    this.userIdCounter = 1;
    this.courseIdCounter = 1;
    this.sectionIdCounter = 1;
    this.lectureIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.lectureProgressIdCounter = 1;
    this.reviewIdCounter = 1;
    this.adminLogIdCounter = 1;
    this.platformSettingIdCounter = 1;
    this.courseApprovalIdCounter = 1;
    this.assignmentIdCounter = 1;
    this.submissionIdCounter = 1;
    this.quizQuestionIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
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
    
    // Cast to User type with proper null handling for optional fields
    const user = {
      id,
      createdAt: now,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      fullName: insertUser.fullName,
      bio: insertUser.bio ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
      role: insertUser.role || "student"  // Default role if not specified
    } as User;
    
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
  
  async getCourses(options?: { category?: string, search?: string, instructorId?: number, status?: string }): Promise<Course[]> {
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

      if (options.status) {
        courses = courses.filter(course => course.status === options.status);
      }
    }
    
    return courses;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const now = new Date();
    
    // Cast with proper null handling for optional fields
    const course = {
      id, 
      createdAt: now,
      title: insertCourse.title,
      description: insertCourse.description,
      instructorId: insertCourse.instructorId,
      category: insertCourse.category,
      price: insertCourse.price,
      level: insertCourse.level,
      totalLectures: insertCourse.totalLectures,
      totalDuration: insertCourse.totalDuration,
      imageUrl: insertCourse.imageUrl ?? null,
      subcategory: insertCourse.subcategory ?? null,
      rating: 0,
      reviewCount: 0,
      status: insertCourse.status || "draft"
    } as Course;
    
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
    
    // Cast with proper null handling for optional fields
    const lecture = {
      id,
      title: insertLecture.title,
      order: insertLecture.order,
      sectionId: insertLecture.sectionId,
      videoUrl: insertLecture.videoUrl ?? null,
      fileUrl: insertLecture.fileUrl ?? null,
      content: insertLecture.content ?? null,
      duration: insertLecture.duration,
      description: insertLecture.description ?? null,
      isPublished: insertLecture.isPublished ?? false
    } as Lecture;
    
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
    
    // Cast with proper null handling for optional fields
    const progress = {
      id,
      enrollmentId: insertProgress.enrollmentId,
      lectureId: insertProgress.lectureId,
      completed: insertProgress.completed ?? null,
      lastAccessed: now
    } as LectureProgress;
    
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
    
    // Cast with proper null handling for optional fields
    const review = {
      id,
      courseId: insertReview.courseId,
      userId: insertReview.userId,
      rating: insertReview.rating,
      comment: insertReview.comment ?? null,
      createdAt: now
    } as Review;
    
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

  // New admin methods
  async getAllUsers(role?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    if (role) {
      users = users.filter(user => user.role === role);
    }
    return users;
  }

  async getAllEnrollments(): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values());
  }

  async getAllReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const id = this.adminLogIdCounter++;
    const now = new Date();
    
    // Cast with proper null handling for optional fields
    const adminLog = {
      id,
      adminId: log.adminId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? null,
      details: log.details ?? null,
      createdAt: now
    } as AdminLog;
    
    this.adminLogs.set(id, adminLog);
    return adminLog;
  }

  async getAdminLogs(adminId?: number, entityType?: string, entityId?: number): Promise<AdminLog[]> {
    let logs = Array.from(this.adminLogs.values());
    
    if (adminId) {
      logs = logs.filter(log => log.adminId === adminId);
    }
    
    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }
    
    if (entityId) {
      logs = logs.filter(log => log.entityId === entityId);
    }
    
    // Sort by most recent first, handling potential nulls
    return logs.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getPlatformSetting(key: string): Promise<PlatformSetting | undefined> {
    return Array.from(this.platformSettings.values())
      .find(setting => setting.key === key);
  }

  async getAllPlatformSettings(category?: string): Promise<PlatformSetting[]> {
    let settings = Array.from(this.platformSettings.values());
    
    if (category) {
      settings = settings.filter(setting => setting.category === category);
    }
    
    return settings;
  }

  async createOrUpdatePlatformSetting(setting: InsertPlatformSetting): Promise<PlatformSetting> {
    const existingSetting = await this.getPlatformSetting(setting.key);
    
    if (existingSetting) {
      const now = new Date();
      const updatedSetting: PlatformSetting = {
        ...existingSetting,
        value: setting.value,
        updatedBy: setting.updatedBy,
        updatedAt: now
      };
      this.platformSettings.set(existingSetting.id, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.platformSettingIdCounter++;
      const now = new Date();
      const newSetting: PlatformSetting = {
        ...setting,
        id,
        updatedAt: now
      };
      this.platformSettings.set(id, newSetting);
      return newSetting;
    }
  }

  async getCourseApproval(courseId: number): Promise<CourseApproval | undefined> {
    return Array.from(this.courseApprovals.values())
      .find(approval => approval.courseId === courseId);
  }

  async createCourseApproval(approval: InsertCourseApproval): Promise<CourseApproval> {
    const id = this.courseApprovalIdCounter++;
    const now = new Date();
    
    // Cast with proper null handling for optional fields
    const courseApproval = {
      id,
      courseId: approval.courseId,
      status: approval.status || "pending",
      reviewedBy: approval.reviewedBy ?? null,
      reviewedAt: null,
      feedback: approval.feedback ?? null,
      updatedAt: now
    } as CourseApproval;
    
    this.courseApprovals.set(id, courseApproval);
    return courseApproval;
  }

  async updateCourseApproval(courseId: number, data: Partial<CourseApproval>): Promise<CourseApproval | undefined> {
    const approval = await this.getCourseApproval(courseId);
    if (!approval) return undefined;
    
    const now = new Date();
    const updatedApproval: CourseApproval = {
      ...approval,
      ...data,
      updatedAt: now
    };
    
    if (data.status && (data.status === "approved" || data.status === "rejected") && !approval.reviewedAt) {
      updatedApproval.reviewedAt = now;
    }
    
    this.courseApprovals.set(approval.id, updatedApproval);
    return updatedApproval;
  }

  async getCourseApprovals(status?: string): Promise<CourseApproval[]> {
    let approvals = Array.from(this.courseApprovals.values());
    
    if (status) {
      approvals = approvals.filter(approval => approval.status === status);
    }
    
    return approvals;
  }

  // Assignment methods
  async getAssignment(id: number): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }

  async getAssignmentsByCourseId(courseId: number): Promise<Assignment[]> {
    return Array.from(this.assignments.values())
      .filter(assignment => assignment.courseId === courseId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const id = this.assignmentIdCounter++;
    const now = new Date();
    
    // Cast with proper null handling for optional fields
    const newAssignment = {
      id,
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      totalPoints: assignment.totalPoints || 100,
      attachmentUrl: assignment.attachmentUrl ?? null,
      assignmentType: assignment.assignmentType || "assignment",
      createdAt: now
    } as Assignment;
    
    this.assignments.set(id, newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: number, data: Partial<Assignment>): Promise<Assignment | undefined> {
    const assignment = this.assignments.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment = { ...assignment, ...data };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    if (!this.assignments.has(id)) return false;
    
    // Delete associated quiz questions
    const quizQuestions = await this.getQuizQuestionsByAssignmentId(id);
    for (const question of quizQuestions) {
      this.quizQuestions.delete(question.id);
    }
    
    // Delete associated submissions
    const submissions = await this.getSubmissionsByAssignmentId(id);
    for (const submission of submissions) {
      this.submissions.delete(submission.id);
    }
    
    this.assignments.delete(id);
    return true;
  }

  // Submission methods
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getUserSubmissionForAssignment(userId: number, assignmentId: number): Promise<Submission | undefined> {
    return Array.from(this.submissions.values()).find(
      submission => submission.userId === userId && submission.assignmentId === assignmentId
    );
  }

  async getSubmissionsByAssignmentId(assignmentId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(submission => submission.assignmentId === assignmentId)
      .sort((a, b) => {
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return a.submittedAt.getTime() - b.submittedAt.getTime();
      });
  }

  async getSubmissionsByUserId(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(submission => submission.userId === userId)
      .sort((a, b) => {
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return a.submittedAt.getTime() - b.submittedAt.getTime();
      });
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.submissionIdCounter++;
    const now = new Date();
    
    // Check if the assignment exists
    const assignment = await this.getAssignment(insertSubmission.assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${insertSubmission.assignmentId} not found`);
    }
    
    // Check if a submission already exists for this user and assignment
    const existingSubmission = await this.getUserSubmissionForAssignment(
      insertSubmission.userId, 
      insertSubmission.assignmentId
    );
    
    if (existingSubmission) {
      throw new Error("A submission already exists for this assignment");
    }
    
    // Check if the submission is late
    const status = now > assignment.dueDate ? "late" : (insertSubmission.status || "submitted");
    
    // Cast with proper null handling for optional fields
    const submission = {
      id,
      assignmentId: insertSubmission.assignmentId,
      userId: insertSubmission.userId,
      submissionText: insertSubmission.submissionText ?? null,
      attachmentUrl: insertSubmission.attachmentUrl ?? null,
      submittedAt: now,
      grade: null,
      feedback: null,
      gradedBy: null,
      gradedAt: null,
      status
    } as Submission;
    
    this.submissions.set(id, submission);
    return submission;
  }

  async updateSubmission(id: number, data: Partial<Submission>): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, ...data };
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  async gradeSubmission(id: number, grade: number, feedback: string, gradedBy: number): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    
    const now = new Date();
    const updatedSubmission = { 
      ...submission, 
      grade, 
      feedback, 
      gradedBy, 
      gradedAt: now,
      status: "graded"
    };
    
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Quiz question methods
  async getQuizQuestion(id: number): Promise<QuizQuestion | undefined> {
    return this.quizQuestions.get(id);
  }

  async getQuizQuestionsByAssignmentId(assignmentId: number): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter(question => question.assignmentId === assignmentId)
      .sort((a, b) => a.order - b.order);
  }

  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = this.quizQuestionIdCounter++;
    
    // Check if the assignment exists and is a quiz
    const assignment = await this.getAssignment(insertQuestion.assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${insertQuestion.assignmentId} not found`);
    }
    
    if (assignment.assignmentType !== "quiz") {
      throw new Error("Quiz questions can only be added to quiz assignments");
    }
    
    // Cast with proper null handling for optional fields
    const question = {
      id,
      assignmentId: insertQuestion.assignmentId,
      questionText: insertQuestion.questionText,
      questionType: insertQuestion.questionType || "multiple_choice",
      options: insertQuestion.options,
      correctAnswer: insertQuestion.correctAnswer,
      points: insertQuestion.points || 1,
      order: insertQuestion.order
    } as QuizQuestion;
    
    this.quizQuestions.set(id, question);
    return question;
  }

  async updateQuizQuestion(id: number, data: Partial<QuizQuestion>): Promise<QuizQuestion | undefined> {
    const question = this.quizQuestions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...data };
    this.quizQuestions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuizQuestion(id: number): Promise<boolean> {
    if (!this.quizQuestions.has(id)) return false;
    this.quizQuestions.delete(id);
    return true;
  }

  async getPlatformStats(): Promise<{
    totalUsers: number,
    totalCourses: number,
    totalEnrollments: number,
    totalReviews: number,
    averageRating: number
  }> {
    const users = await this.getAllUsers();
    const courses = await this.getCourses();
    const enrollments = await this.getAllEnrollments();
    const reviews = await this.getAllReviews();
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;
    
    return {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalReviews: reviews.length,
      averageRating
    };
  }
}

export const storage = new MemStorage();
