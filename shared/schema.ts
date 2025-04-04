import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  role: text("role").notNull().default("student"), // student, instructor, admin
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  iconClass: text("icon_class").notNull(),
  bgColor: text("bg_color").notNull(),
  textColor: text("text_color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorId: integer("instructor_id").notNull(), // Foreign key to users
  categoryId: integer("category_id").notNull(), // Foreign key to categories
  price: doublePrecision("price").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  level: text("level").notNull(), // beginner, intermediate, advanced
  durationHours: integer("duration_hours").notNull(),
  totalStudents: integer("total_students").default(0),
  averageRating: doublePrecision("average_rating").default(0),
  ratingCount: integer("rating_count").default(0),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, totalStudents: true, averageRating: true, ratingCount: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Sections (modules) table
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(), // Foreign key to courses
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
});

export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

// Lectures table
export const lectures = pgTable("lectures", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull(), // Foreign key to sections
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  duration: integer("duration").notNull(), // in seconds
  orderIndex: integer("order_index").notNull(),
  lectureType: text("lecture_type").notNull(), // video, document, quiz
});

export const insertLectureSchema = createInsertSchema(lectures).omit({ id: true });
export type InsertLecture = z.infer<typeof insertLectureSchema>;
export type Lecture = typeof lectures.$inferSelect;

// Enrollments table - tracks student enrollment in courses
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  courseId: integer("course_id").notNull(), // Foreign key to courses
  enrollmentDate: timestamp("enrollment_date").notNull().defaultNow(),
  completed: boolean("completed").default(false),
  progressPercent: doublePrecision("progress_percent").default(0),
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrollmentDate: true, completed: true, progressPercent: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

// Progress table - tracks student progress through lectures
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  lectureId: integer("lecture_id").notNull(), // Foreign key to lectures
  completed: boolean("completed").default(false),
  lastWatchedPosition: integer("last_watched_position").default(0), // in seconds
  lastWatchedDate: timestamp("last_watched_date"),
});

export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, completed: true, lastWatchedPosition: true, lastWatchedDate: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  courseId: integer("course_id").notNull(), // Foreign key to courses
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Testimonials table for displaying on homepage
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Foreign key to users
  text: text("text").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  featured: boolean("featured").default(false),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
