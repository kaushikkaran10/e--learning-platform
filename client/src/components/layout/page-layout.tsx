import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import Footer from "./footer";
import MobileMenu from "./mobile-menu";

interface PageLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function PageLayout({ children, showSidebar = true }: PageLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ${!showSidebar ? 'container mx-auto' : ''}`}>
          {children}
        </main>
      </div>
      
      <Footer />
      
      {/* Mobile Menu Overlay */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </div>
  );
}
