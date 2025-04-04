import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
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
  price: real("price").notNull(),
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
  videoUrl: text("video_url").notNull(),
  duration: integer("duration").notNull(), // in minutes
  order: integer("order").notNull(),
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
  price: true,
  level: true,
  totalLectures: true,
  totalDuration: true,
  status: true,
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
  videoUrl: true,
  duration: true,
  order: true,
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

export type CourseApproval = typeof courseApprovals.$inferSelect;
export type InsertCourseApproval = z.infer<typeof insertCourseApprovalSchema>;
