import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-leaf-900 text-rice-100">
      <div className="leaf-edge text-leaf-900 rotate-180" aria-hidden="true" />

      <div className="px-4 xs:px-6 py-8 md:py-10 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
        <div>
          <span className="font-display font-bold text-base xs:text-lg text-turmeric-100">Selvam Maligai Store</span>
          <p className="text-xs xs:text-sm text-rice-100/60 mt-2">
            Your neighbourhood provisions store, now online. Komarapalayam, Tamil Nadu.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Facebook" className="hover:text-turmeric-400 transition-colors"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-turmeric-400 transition-colors"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-turmeric-400 transition-colors"><Twitter size={18} /></a>
          </div>
        </div>

        <FooterColumn title="Shop" links={['All Products', 'Today\'s Deals', 'New Arrivals', 'Categories']} />
        <FooterColumn title="Support" links={['Track Order', 'Contact Us', 'Grievances', 'Returns Policy']} />
        <FooterColumn title="Company" links={['About Us', 'Careers', 'Privacy Policy', 'Terms of Service']} />
      </div>

      <div className="border-t border-rice-100/10 px-4 xs:px-6 py-3 md:py-4 text-xs text-rice-100/50 text-center">
        © {new Date().getFullYear()} Selvam Maligai Store. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-semibold text-xs xs:text-sm text-turmeric-100 mb-2 md:mb-3">{title}</h3>
      <ul className="space-y-1 md:space-y-2 text-xs xs:text-sm text-rice-100/70">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-turmeric-400 transition-colors">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
