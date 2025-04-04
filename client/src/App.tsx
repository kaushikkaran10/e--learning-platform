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
