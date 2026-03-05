import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const sections = [
  { id: 'overview', label: 'Overview', num: '01' },
  { id: 'data-collect', label: 'Data We Collect', num: '02' },
  { id: 'how-use', label: 'How We Use It', num: '03' },
  { id: 'data-sharing', label: 'Data Sharing', num: '04' },
  { id: 'retention', label: 'Retention', num: '05' },
  { id: 'your-rights', label: 'Your Rights', num: '06' },
  { id: 'security', label: 'Security', num: '07' },
  { id: 'contact', label: 'Contact', num: '08' },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="privacy-page min-h-screen relative overflow-x-hidden">
      {/* BG gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-[10%] w-[80%] h-[50%] bg-[radial-gradient(ellipse_80%_50%_at_10%_0%,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[40%] bg-[radial-gradient(ellipse_60%_40%_at_90%_100%,rgba(200,245,90,0.07),transparent_55%)]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.07]">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8f55a] to-[#8b5cf6] flex items-center justify-center text-sm font-bold text-black font-serif tracking-tighter">
            T
          </div>
          <span className="font-serif text-lg text-white tracking-tight">TizzaAI</span>
        </Link>
        <Link to="/" className="text-xs text-[#6b6b80] uppercase tracking-widest hover:text-[#c8f55a] transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to app
        </Link>
      </nav>

      {/* Hero */}
      <header className="relative z-10 pt-40 pb-16 px-6 md:px-12 max-w-[860px] mx-auto">
        <div className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] uppercase text-[#c8f55a] mb-6 font-medium before:block before:w-6 before:h-px before:bg-[#c8f55a]">
          Legal
        </div>
        <h1 className="font-serif text-[clamp(2.8rem,6vw,4.5rem)] leading-[1.1] text-white tracking-tight mb-6">
          Privacy <em className="italic text-[#c8f55a]">Policy</em>
        </h1>
        <div className="flex gap-8 text-xs text-[#6b6b80] tracking-wide border-t border-white/[0.07] pt-6 mt-8">
          <span className="flex items-center gap-1.5">📅 Effective: January 1, 2025</span>
          <span className="flex items-center gap-1.5">🔄 Last updated: March 1, 2025</span>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 max-w-[860px] mx-auto px-6 md:px-12 pb-32 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-16 items-start">
        {/* TOC */}
        <aside className="hidden md:block sticky top-20 pt-4">
          <div className="text-[0.68rem] tracking-[0.14em] uppercase text-[#6b6b80] mb-4 font-medium">On this page</div>
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`block text-[0.8rem] py-1.5 pl-4 border-l transition-all ${
                activeSection === id
                  ? 'text-[#e8e8f0] border-l-[#c8f55a]'
                  : 'text-[#6b6b80] border-l-white/[0.07] hover:text-[#e8e8f0] hover:border-l-[#c8f55a]'
              }`}
            >
              {label}
            </a>
          ))}
        </aside>

        {/* Content */}
        <div className="space-y-14">
          {/* 01 Overview */}
          <section id="overview" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">01</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Overview</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">
              TizzaAI ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard data when you use our AI-powered platform at tizzaai.lovable.app.
            </p>
            <div className="bg-[#111118] border border-white/[0.07] border-l-[3px] border-l-[#c8f55a] rounded p-5 my-6">
              <p className="text-[0.87rem] text-[#e8e8f0]/85 !mb-0">
                We do not sell your personal data to third parties. Your conversations and inputs are used solely to provide and improve the TizzaAI service.
              </p>
            </div>
            <p className="text-[0.93rem] text-[#e8e8f0]/85">
              By using TizzaAI, you agree to the terms described in this policy. If you disagree, please discontinue use and contact us to delete your account.
            </p>
          </section>

          {/* 02 Data We Collect */}
          <section id="data-collect" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">02</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Data We Collect</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">We collect only what we need to deliver a great experience:</p>
            <div className="overflow-x-auto my-6">
              <table className="w-full text-[0.85rem] border-collapse">
                <thead>
                  <tr>
                    {['Category', 'Examples', 'Purpose'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-medium text-[#c8f55a] text-[0.72rem] tracking-[0.1em] uppercase border-b border-white/[0.07]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Account info', 'Email, name, password hash', 'Authentication & support'],
                    ['Usage data', 'Prompts, responses, session timestamps', 'Service delivery & improvement'],
                    ['Device data', 'IP address, browser type, OS', 'Security & analytics'],
                    ['Payment info', 'Billing details (via Stripe)', 'Subscription management'],
                  ].map(([cat, ex, purpose]) => (
                    <tr key={cat} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 border-b border-white/[0.07] text-[#e8e8f0]/85 align-top">{cat}</td>
                      <td className="px-4 py-3 border-b border-white/[0.07] text-[#e8e8f0]/85 align-top">{ex}</td>
                      <td className="px-4 py-3 border-b border-white/[0.07] text-[#e8e8f0]/85 align-top">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[0.93rem] text-[#e8e8f0]/85">We do not collect sensitive categories of data such as health information, biometric data, or government identifiers.</p>
          </section>

          {/* 03 How We Use */}
          <section id="how-use" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">03</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">How We Use Your Data</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">Your data allows us to operate and continuously improve TizzaAI:</p>
            <ul className="space-y-1 mb-4">
              {[
                'Provide, personalize, and improve our AI features',
                'Authenticate your identity and protect your account',
                'Process payments and manage subscriptions',
                'Send essential service notifications and updates',
                'Monitor for abuse, fraud, or policy violations',
                'Conduct aggregated, anonymized research to enhance model quality',
              ].map((item) => (
                <li key={item} className="text-[0.9rem] text-[#e8e8f0]/85 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-[#c8f55a] before:text-xs">{item}</li>
              ))}
            </ul>
            <div className="bg-[#111118] border border-white/[0.07] border-l-[3px] border-l-[#c8f55a] rounded p-5 my-6">
              <p className="text-[0.87rem] text-[#e8e8f0]/85 !mb-0">
                Your conversation content is never used to train third-party AI models without your explicit opt-in consent.
              </p>
            </div>
          </section>

          {/* 04 Data Sharing */}
          <section id="data-sharing" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">04</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Data Sharing</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">We share data only in limited circumstances:</p>
            <ul className="space-y-1 mb-4">
              {[
                'Service providers — trusted partners (e.g., cloud hosting, payment processors) bound by strict data agreements',
                'Legal obligations — when required by law, subpoena, or to protect rights and safety',
                'Business transfers — in the event of a merger or acquisition, with advance notice to you',
              ].map((item) => (
                <li key={item} className="text-[0.9rem] text-[#e8e8f0]/85 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-[#c8f55a] before:text-xs">{item}</li>
              ))}
            </ul>
            <p className="text-[0.93rem] text-[#e8e8f0]/85">We never sell, rent, or broker personal data to advertisers or data brokers.</p>
          </section>

          {/* 05 Retention */}
          <section id="retention" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">05</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Data Retention</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">
              We retain your data for as long as your account is active or as needed to provide services. You may delete your account at any time from your settings, after which personal data is purged within 30 days.
            </p>
            <p className="text-[0.93rem] text-[#e8e8f0]/85">Anonymized, aggregated usage statistics may be retained indefinitely for product analytics.</p>
          </section>

          {/* 06 Your Rights */}
          <section id="your-rights" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">06</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Your Rights</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="space-y-1 mb-4">
              {[
                'Access — Request a copy of data we hold about you',
                'Correction — Ask us to fix inaccurate or incomplete data',
                'Deletion — Request erasure of your personal data',
                'Portability — Receive your data in a machine-readable format',
                'Objection — Opt out of certain processing activities',
              ].map((item) => (
                <li key={item} className="text-[0.9rem] text-[#e8e8f0]/85 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-[#c8f55a] before:text-xs">{item}</li>
              ))}
            </ul>
            <p className="text-[0.93rem] text-[#e8e8f0]/85">To exercise any of these rights, contact us at the address below. We will respond within 30 days.</p>
          </section>

          {/* 07 Security */}
          <section id="security" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">07</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Security</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85">
              We implement industry-standard safeguards including TLS encryption in transit, AES-256 encryption at rest, access controls, and regular security audits. No system is 100% secure — if you suspect unauthorized access to your account, contact us immediately.
            </p>
          </section>

          {/* 08 Contact */}
          <section id="contact" className="animate-fade-up">
            <div className="text-[0.68rem] text-[#c8f55a] tracking-[0.1em] uppercase font-medium mb-2">08</div>
            <h2 className="font-serif text-2xl text-white tracking-tight mb-4 leading-tight">Contact Us</h2>
            <p className="text-[0.93rem] text-[#e8e8f0]/85 mb-4">Questions, concerns, or requests regarding this policy? Reach out — we're happy to help.</p>
            <div className="bg-[#111118] border border-white/[0.07] rounded-lg p-8 mt-6">
              <p className="text-[0.93rem] text-[#e8e8f0]/85 font-medium mb-2">TizzaAI Privacy Team</p>
              <p className="text-[0.87rem] text-[#e8e8f0]/85 mb-3">We aim to respond to all inquiries within 2 business days.</p>
              <p className="text-[0.87rem]">
                📧 <a href="mailto:privacy@tizzaai.com" className="text-[#c8f55a] hover:underline font-medium">privacy@tizzaai.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07] max-w-[860px] mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#6b6b80]">© 2025 TizzaAI. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-xs text-[#6b6b80] hover:text-[#e8e8f0] transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
