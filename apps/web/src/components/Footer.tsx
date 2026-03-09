import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Discover", href: "/discover" },
    { label: "Reels", href: "/reels" },
    { label: "Artisans", href: "/artisans" },
  ];

  const artisanLinks = [
    { label: "Upload Product", href: "/upload" },
    { label: "Register", href: "/register" },
  ];

  const aboutLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Terms", href: "#" },
  ];

  return (
    <footer className="mt-auto border-t border-slate-200/50 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Footer Content Grid */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                <span className="text-white font-bold text-xs">CB</span>
              </div>
              <h3 className="text-lg font-bold text-primary">CraftBridge</h3>
            </div>
            <p className="text-sm text-slate leading-relaxed">
              Connecting artisans with craft enthusiasts worldwide. Discover authentic handcrafted products.
            </p>
          </div>
          
          {/* Browse */}
          <div>
            <h4 className="font-semibold text-ink text-sm uppercase tracking-wide mb-4">Browse</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate hover:text-primary transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* For Artisans */}
          <div>
            <h4 className="font-semibold text-ink text-sm uppercase tracking-wide mb-4">For Artisans</h4>
            <ul className="space-y-2.5">
              {artisanLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate hover:text-primary transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h4 className="font-semibold text-ink text-sm uppercase tracking-wide mb-4">Company</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate hover:text-primary transition-colors duration-200 font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-12 border-t border-slate-200/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate">
            &copy; {currentYear} CraftBridge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate hover:text-primary transition-colors duration-200 font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate hover:text-primary transition-colors duration-200 font-medium">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-slate hover:text-primary transition-colors duration-200 font-medium">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
