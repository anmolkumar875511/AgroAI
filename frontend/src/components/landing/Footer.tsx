import { Leaf, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: ['Dashboard', 'Visit Planner', 'Risk Analyzer', 'Analytics', 'Mobile App'],
  },
  {
    title: 'Company',
    links: ['About Syngenta', 'Hackathon', 'Careers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Community', 'Blog'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Data Security'],
  },
];

const socialIcons = [
  { icon: Github, label: 'GitHub' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer className="bg-deep-forest py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Logo & Tagline */}
          <div className="lg:max-w-xs">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-lime-green" />
              <span className="text-xl font-bold text-white tracking-tight">AgroAI</span>
            </div>
            <p className="mt-2 text-sm text-white/50">
              Farmer First. AI Powered.
            </p>
          </div>

          {/* Link Columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h4 className="text-xs font-semibold tracking-[0.08em] uppercase text-white/40 mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/10" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            2026 AgroAI by Team AgroAI. Built for Syngenta Hackathon.
          </p>
          <div className="flex items-center gap-5">
            {socialIcons.map((social) => (
              <span
                key={social.label}
                className="text-white/50 hover:text-white transition-colors cursor-pointer"
                title={social.label}
              >
                <social.icon className="w-5 h-5" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
