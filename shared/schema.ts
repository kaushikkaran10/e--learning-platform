import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("student"), // student, instructor, or admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Course model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  instructorId: integer("instructor_id").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  price: real("price").notNull().default(0),
  level: text("level").notNull(),
  totalLectures: integer("total_lectures").notNull(),
  totalDuration: integer("total_duration").notNull(), // in minutes
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  status: text("status").default("draft"), // draft, pending_approval, published, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// Section model
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

// Lecture model
export const lectures = pgTable("lectures", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  videoUrl: text("video_url"),
  fileUrl: text("file_url"),
  duration: integer("duration").notNull(), // in minutes
  order: integer("order").notNull(),
  isPublished: boolean("is_published").default(false),
});

// Enrollment model
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  progress: integer("progress").default(0), // 0-100%
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Progress tracking model
export const lectureProgress = pgTable("lecture_progress", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull(),
  lectureId: integer("lecture_id").notNull(),
  completed: boolean("completed").default(false),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

// Reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  bio: true,
  avatarUrl: true,
  role: true,
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  imageUrl: true,
  instructorId: true,
  category: true,
  subcategory: true,
  level: true,
  totalLectures: true,
  totalDuration: true,
  status: true,
}).extend({
  price: z.number().default(0),
});

export const insertSectionSchema = createInsertSchema(sections).pick({
  courseId: true,
  title: true,
  order: true,
});

export const insertLectureSchema = createInsertSchema(lectures).pick({
  sectionId: true,
  title: true,
  description: true,
  content: true,
  videoUrl: true,
  fileUrl: true,
  duration: true,
  order: true,
  isPublished: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  userId: true,
  courseId: true,
});

export const insertLectureProgressSchema = createInsertSchema(lectureProgress).pick({
  enrollmentId: true,
  lectureId: true,
  completed: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  courseId: true,
  rating: true,
  comment: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;

export type Lecture = typeof lectures.$inferSelect;
export type InsertLecture = z.infer<typeof insertLectureSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type LectureProgress = typeof lectureProgress.$inferSelect;
export type InsertLectureProgress = z.infer<typeof insertLectureProgressSchema>;

// Admin log model
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // user, course, etc.
  entityId: integer("entity_id"), // Can be null for global actions
  details: text("details"), // JSON string with additional details
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform settings model
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull(),
  updatedBy: integer("updated_by").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course approval status
export const courseApprovals = pgTable("course_approvals", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: integer("reviewed_by"), // admin ID who reviewed
  reviewedAt: timestamp("reviewed_at"),
  feedback: text("feedback"), // Feedback for instructor if rejected
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add Zod schemas for new models
export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  adminId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
});

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).pick({
  key: true,
  value: true,
  category: true,
  updatedBy: true,
});

export const insertCourseApprovalSchema = createInsertSchema(courseApprovals).pick({
  courseId: true,
  status: true,
  reviewedBy: true,
  feedback: true,
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;

// Assignment model
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  totalPoints: integer("total_points").notNull().default(100),
  attachmentUrl: text("attachment_url"), // Optional file attachment URL
  assignmentType: text("assignment_type").notNull().default("assignment"), // assignment, quiz, project
  createdAt: timestamp("created_at").defaultNow(),
});

// Submission model
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  userId: integer("user_id").notNull(),
  submissionText: text("submission_text"),
  attachmentUrl: text("attachment_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  grade: integer("grade"), // null until graded
  feedback: text("feedback"),
  gradedBy: integer("graded_by"), // instructor ID who graded
  gradedAt: timestamp("graded_at"),
  status: text("status").notNull().default("submitted"), // submitted, graded, late
});

// Quiz questions model for quizzes
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(), // Foreign key to assignment
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull().default("multiple_choice"), // multiple_choice, true_false, short_answer
  options: jsonb("options"), // JSON array of options for multiple choice questions
  correctAnswer: text("correct_answer").notNull(),
  points: integer("points").notNull().default(1),
  order: integer("order").notNull(),
});

// Insert schemas for new models
export const insertAssignmentSchema = createInsertSchema(assignments).pick({
  courseId: true,
  title: true,
  description: true,
  dueDate: true,
  totalPoints: true,
  attachmentUrl: true,
  assignmentType: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  assignmentId: true,
  userId: true,
  submissionText: true,
  attachmentUrl: true,
  status: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).pick({
  assignmentId: true,
  questionText: true,
  questionType: true,
  options: true,
  correctAnswer: true,
  points: true,
  order: true,
});

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

export type CourseApproval = typeof courseApprovals.$inferSelect;
export type InsertCourseApproval = z.infer<typeof insertCourseApprovalSchema>;
