import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">LearnHub</h3>
            <p className="text-gray-400">Your pathway to knowledge and skills. Join millions of students learning on LearnHub.</p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Course Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/courses?category=1"><a className="text-gray-400 hover:text-white">Programming</a></Link></li>
              <li><Link href="/courses?category=2"><a className="text-gray-400 hover:text-white">Data Science</a></Link></li>
              <li><Link href="/courses?category=3"><a className="text-gray-400 hover:text-white">Design</a></Link></li>
              <li><Link href="/courses?category=4"><a className="text-gray-400 hover:text-white">Business</a></Link></li>
              <li><Link href="/courses?category=5"><a className="text-gray-400 hover:text-white">Languages</a></Link></li>
              <li><Link href="/courses?category=6"><a className="text-gray-400 hover:text-white">Science</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Useful Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about"><a className="text-gray-400 hover:text-white">About Us</a></Link></li>
              <li><Link href="/careers"><a className="text-gray-400 hover:text-white">Careers</a></Link></li>
              <li><Link href="/blog"><a className="text-gray-400 hover:text-white">Blog</a></Link></li>
              <li><Link href="/become-instructor"><a className="text-gray-400 hover:text-white">Become an Instructor</a></Link></li>
              <li><Link href="/affiliate"><a className="text-gray-400 hover:text-white">Affiliate Program</a></Link></li>
              <li><Link href="/contact"><a className="text-gray-400 hover:text-white">Contact Us</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help"><a className="text-gray-400 hover:text-white">Help Center</a></Link></li>
              <li><Link href="/terms"><a className="text-gray-400 hover:text-white">Terms of Service</a></Link></li>
              <li><Link href="/privacy"><a className="text-gray-400 hover:text-white">Privacy Policy</a></Link></li>
              <li><Link href="/cookie-policy"><a className="text-gray-400 hover:text-white">Cookie Policy</a></Link></li>
              <li><Link href="/accessibility"><a className="text-gray-400 hover:text-white">Accessibility Statement</a></Link></li>
              <li><Link href="/sitemap"><a className="text-gray-400 hover:text-white">Sitemap</a></Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-4">
              <Link href="/terms"><a className="text-gray-400 hover:text-white text-sm">Terms</a></Link>
              <Link href="/privacy"><a className="text-gray-400 hover:text-white text-sm">Privacy</a></Link>
              <Link href="/cookie-policy"><a className="text-gray-400 hover:text-white text-sm">Cookies</a></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
