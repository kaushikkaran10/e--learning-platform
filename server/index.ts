import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedInitialData() {
  try {
    console.log("Starting to seed initial data...");
    
    // Create users if they don't exist
    const roles = [
      { username: "admin", password: "admin123", email: "admin@example.com", fullName: "Admin User", role: "admin" },
      { username: "instructor", password: "instructor123", email: "instructor@example.com", fullName: "Demo Instructor", role: "instructor" },
      { username: "student", password: "student123", email: "student@example.com", fullName: "Demo Student", role: "student" }
    ];
    
    let instructor;
    
    for (const userData of roles) {
      const existingUser = await storage.getUserByUsername(userData.username);
      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        const user = await storage.createUser({
          ...userData,
          password: hashedPassword
        });
        console.log(`Created ${userData.role} user: ${userData.username}`);
        
        if (userData.role === "instructor") {
          instructor = user;
        }
      } else {
        console.log(`${userData.role} user already exists: ${userData.username}`);
        if (userData.role === "instructor") {
          instructor = existingUser;
        }
      }
    }
    
    // Create a course if none exists
    if (instructor) {
      const existingCourses = await storage.getCourses();
      
      if (existingCourses.length === 0) {
        // Create a sample course
        const course = await storage.createCourse({
          title: "Introduction to Web Development",
          description: "Learn the basics of HTML, CSS, and JavaScript for building modern websites.",
          instructorId: instructor.id,
          category: "Web Development",
          subcategory: "Frontend",
          price: 0,
          level: "beginner",
          imageUrl: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
          totalLectures: 10,
          totalDuration: 300,
          status: "published"
        });
        
        console.log("Created sample course:", course.title);
        
        // Create sections
        const section = await storage.createSection({
          courseId: course.id,
          title: "HTML Fundamentals",
          order: 1
        });
        
        // Create lectures
        await storage.createLecture({
          sectionId: section.id,
          title: "Introduction to HTML",
          description: "Learn about HTML tags and structure",
          videoUrl: "https://example.com/videos/intro-html",
          duration: 15,
          order: 1
        });
        
        console.log("Created sample section and lecture");
        
        // Create assignment
        await storage.createAssignment({
          courseId: course.id,
          title: "Build a Personal Portfolio Page",
          description: "Create a personal portfolio using HTML and CSS",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalPoints: 100,
          assignmentType: "project"
        });
        
        console.log("Created sample assignment");
      } else {
        console.log("Courses already exist, skipping course creation");
      }
    }
    
    console.log("Seed data creation complete!");
  } catch (error) {
    console.error("Error creating seed data:", error);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed initial data first
  await seedInitialData();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
