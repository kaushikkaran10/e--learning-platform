// This script must be run with tsx
import { storage } from './server/storage';
import { hashPassword } from './server/auth';

async function createAdminUser() {
  try {
    const adminUser = await storage.createUser({
      username: "admin",
      password: "admin123", // You should use a stronger password in production
      email: "admin@example.com",
      fullName: "System Administrator",
      role: "admin"
    });
    
    console.log("Admin user created successfully:", adminUser);
    
    // Verify the user was created and has admin role
    const retrievedUser = await storage.getUserByUsername("admin");
    console.log("Retrieved user:", retrievedUser);
  } catch (error) {
    console.error("Failed to create admin user:", error);
  }
}

createAdminUser();