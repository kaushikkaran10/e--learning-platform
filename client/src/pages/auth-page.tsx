import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { FluidSpinner } from "@/components/ui/fluid-spinner";
import { ThemedSpinner } from "@/components/ui/themed-spinner";
import { Link } from "wouter";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["student", "instructor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      role: "student",
      bio: "",
      avatarUrl: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword as it's not part of our schema
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-4 border-b bg-white">
        <div className="container flex justify-center md:justify-start">
          <Link href="/" className="text-2xl font-bold text-primary flex items-center">
            <GraduationCap className="mr-2" />
            <span>eduNest</span>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 grid md:grid-cols-2 gap-0">
        {/* Auth Form */}
        <div className="flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="w-full max-w-md">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Welcome Back to eduNest</CardTitle>
                    <CardDescription>
                      Sign in to access your college digital learning portal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username or Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username or email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-2 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-md" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <ThemedSpinner theme="graduate" size="sm" className="mr-2" />
                              Logging in...
                            </>
                          ) : "Enter Your College Hub"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-col items-center space-y-2">
                    <div className="text-sm text-gray-500">
                      Don't have an account?{" "}
                      <button 
                        onClick={() => setActiveTab("register")}
                        className="text-primary hover:underline"
                      >
                        Register now
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Join Your College Digital Hub</CardTitle>
                    <CardDescription>
                      Create an account to access courses, assignments, and faculty communication
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I want to</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="student">Learn as a Student</SelectItem>
                                  <SelectItem value="instructor">Teach as an Instructor</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full mt-2 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-md" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <FluidSpinner theme="code" size={18} className="mr-2" />
                              Creating account...
                            </>
                          ) : "Join Your College Community"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-col items-center space-y-2">
                    <div className="text-sm text-gray-500">
                      Already have an account?{" "}
                      <button 
                        onClick={() => setActiveTab("login")}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="hidden md:flex bg-gradient-to-r from-primary to-blue-600 p-8 flex-col justify-center">
          <div className="max-w-lg mx-auto text-white">
            <h1 className="text-5xl font-bold mb-6 animate-fadeIn">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">Your College, Digitized</span>
            </h1>
            <p className="text-lg opacity-90 mb-8 animate-slideInRight" style={{ animationDelay: "0.2s" }}>
              eduNest brings your classroom experience online. Stay connected with your professors, classmates, and learning materials in one central platform.
            </p>
            
            {/* Student with laptop illustration */}
            <div className="flex justify-center mb-8 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
              <svg width="200" height="160" viewBox="0 0 850 680" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                <path d="M425 640C546.67 640 645 624.4 645 605C645 585.6 546.67 570 425 570C303.33 570 205 585.6 205 605C205 624.4 303.33 640 425 640Z" fill="#E6E6E6"/>
                <path d="M577.83 230.42V361.02C577.83 363.52 577.69 365.98 577.41 368.42C573.51 405.84 540.19 435.02 499.81 435.02H349.38C303.86 435.02 266.93 398.09 266.93 352.57V224.42H332.83V355.31H542.83V230.42H577.83Z" fill="#CCCCCC"/>
                <path d="M350.38 95.02H499.81C545.33 95.02 582.26 131.95 582.26 177.47V361.02C582.26 363.52 582.12 365.98 581.84 368.42C579.62 393.82 565.03 415.77 544.22 428.32C532.53 435.61 518.86 439.45 504.24 439.45H350.38C341.21 439.45 332.38 437.69 324.16 434.45C304.12 425.56 288.41 408.55 281.34 387.41C278.62 379.33 277.14 370.71 277.14 361.74V177.47C277.14 169.82 278.24 162.4 280.29 155.36C290.68 119.86 324.16 95.02 350.38 95.02Z" fill="white"/>
                <path d="M499.81 431.02H355.57C311.77 431.02 276.14 395.39 276.14 351.59V177.47C276.14 133.66 311.77 98.02 355.57 98.02H499.81C543.62 98.02 579.26 133.66 579.26 177.47V351.59C579.26 395.39 543.62 431.02 499.81 431.02Z" stroke="#3F3D56" strokeWidth="2" strokeMiterlimit="10"/>
                <path d="M464.31 364.42H392.01C389.79 364.42 388 362.63 388 360.42C388 358.2 389.79 356.42 392.01 356.42H464.31C466.52 356.42 468.31 358.2 468.31 360.42C468.31 362.63 466.52 364.42 464.31 364.42Z" fill="#3F3D56"/>
                <path d="M573.41 368.42C573.51 405.84 540.19 435.02 499.81 435.02H349.38C303.86 435.02 266.93 398.09 266.93 352.57V282.42L573.41 368.42Z" fill="#F2F2F2"/>
                <path d="M440.8 240.58H410.22C408.01 240.58 406.22 238.8 406.22 236.58C406.22 234.37 408.01 232.58 410.22 232.58H440.8C443.01 232.58 444.8 234.37 444.8 236.58C444.8 238.8 443.01 240.58 440.8 240.58Z" fill="#3F3D56"/>
              </svg>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><circle cx="11" cy="14" r="2"></circle><path d="M13.3 17.7L15.5 20l2.7-3.2"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Assignments & Grading</h3>
                  <p className="opacity-80">Submit work online and get timely feedback</p>
                </div>
              </div>
              
              <div className="flex items-start transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Class Scheduling</h3>
                  <p className="opacity-80">Keep track of your college schedule</p>
                </div>
              </div>
              
              <div className="flex items-start transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 10h.01"></path><path d="M12 10h.01"></path><path d="M16 10h.01"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Faculty Chat</h3>
                  <p className="opacity-80">Direct communication with your professors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
