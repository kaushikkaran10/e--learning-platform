import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailPage from "@/pages/course-detail-page";
import CourseLearnPage from "@/pages/course-learn-page";
import MyLearningPage from "@/pages/my-learning-page";
import InstructorDashboard from "@/pages/instructor-dashboard";
import SpinnerDemoPage from "@/pages/spinner-demo-page";
import MessagingPage from "@/pages/messaging-page";
import CalendarPage from "@/pages/calendar-page";
import StudentResources from "@/pages/student-resources";
import InstructorResources from "@/pages/instructor-resources";
import CourseCategories from "@/pages/course-categories";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:id" component={CourseDetailPage} />
      <ProtectedRoute path="/learn/:id" component={CourseLearnPage} />
      <ProtectedRoute path="/my-learning" component={MyLearningPage} />
      <ProtectedRoute path="/instructor/dashboard" component={InstructorDashboard} />
      <ProtectedRoute path="/messages" component={MessagingPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <Route path="/student-resources" component={StudentResources} />
      <Route path="/instructor-resources" component={InstructorResources} />
      <Route path="/course-categories" component={CourseCategories} />
      <Route path="/ui/spinners" component={SpinnerDemoPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
