import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {UrlState} from "@/context";
import {
  Zap,
  Shield,
  Clock,
  BarChart3,
  QrCode,
  ArrowRight,
  Sparkles,
  Lock,
  FileSpreadsheet,
} from "lucide-react";
import {validateUrl} from "@/lib/validators";

export default function LandingPage() {
  const [longUrl, setLongUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const navigate = useNavigate();
  const {user} = UrlState();

  const handleShorten = (e) => {
    e.preventDefault();
    setUrlError("");

    if (!longUrl) {
      setUrlError("Please enter a URL to shorten.");
      return;
    }

    const check = validateUrl(longUrl);
    if (!check.isValid) {
      setUrlError(check.error);
      return;
    }

    const targetUrl = encodeURIComponent(check.normalizedUrl);
    if (user) {
      navigate(`/dashboard?createNew=${targetUrl}`);
    } else {
      navigate(`/auth?createNew=${targetUrl}`);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="w-full max-w-4xl text-center flex flex-col items-center pt-8">
        {/* Release / Tech Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Production-Ready URL Infrastructure & Analytics</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          High-Performance Short Links. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300">
            Deeper Real-Time Analytics.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Create collision-resistant short URLs with built-in passcode protection,
          dynamic expiration rules, instant QR code export, and privacy-preserving click telemetry.
        </p>

        {/* Interactive URL Shortener Widget */}
        <form
          onSubmit={handleShorten}
          className="w-full max-w-2xl bg-gray-900/80 border border-gray-800 rounded-2xl p-2 sm:p-3 shadow-2xl backdrop-blur flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Paste your loooong link (e.g. https://github.com/profile/repo)"
              value={longUrl}
              onChange={(e) => {
                setLongUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              className="h-12 bg-gray-950/60 border-gray-800 text-sm pl-4 pr-4 rounded-xl focus-visible:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>Shorten Link</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {urlError && (
          <p className="text-xs text-red-400 mt-2 font-medium">{urlError}</p>
        )}

        <div className="flex items-center gap-6 mt-8 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-blue-400" /> Passcode Protection
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-emerald-400" /> Expiration Rules
          </span>
          <span className="flex items-center gap-1">
            <QrCode className="h-3.5 w-3.5 text-purple-400" /> Instant QR Studio
          </span>
        </div>
      </section>

      {/* 2. FEATURE MATRIX GRID */}
      <section className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
            Engineered for Modern Teams & Creators
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Beyond basic redirects. AeroLink provides the control, security, and metrics needed for production links.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Base62 IDs</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Powered by native Web Crypto API yielding over 3.5 trillion unique combinations with automatic database collision retry.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Passcode Protected Links</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Require visitors to enter a passcode before redirecting. Password hashes are verified server-side and never exposed to the client.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Expiration & Click Caps</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Set automated link expiration dates or maximum click limits. Once reached, visitors see a customized unavailable message.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Privacy-First Telemetry</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Track devices, operating systems, browsers, top cities, and countries without storing raw IP addresses (GDPR/CCPA friendly).
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Client-Side QR Studio</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Generate crisp QR codes instantly in browser memory without cloud storage delays. Export high-res PNGs up to 400px.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Time Filters & CSV Export</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Isolate metrics by Today, 7 Days, or 30 Days. Download clean CSV datasets for custom reporting in Excel or Google Sheets.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FAQ ACCORDION SECTION */}
      <section className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-sm">
            Everything you need to know about AeroLink URL infrastructure.
          </p>
        </div>

        <Accordion type="multiple" className="w-full divide-y divide-gray-800 border-t border-b border-gray-800">
          <AccordionItem value="faq-1" className="border-b-0 py-2">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline text-gray-200 hover:text-white">
              How does AeroLink prevent short-code collisions?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-gray-400 leading-relaxed">
              Unlike tutorial projects that use Math.random(), AeroLink uses a 7-character base62 generator backed by crypto.getRandomValues. The database enforces a UNIQUE constraint and our service layer automatically retries on any collision.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border-b-0 py-2">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline text-gray-200 hover:text-white">
              How are password-protected links secured?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-gray-400 leading-relaxed">
              Password hashes are never stored in plaintext and are never exposed to client-side queries. Passcodes are hashed with SHA-256 and checked server-side using a PostgreSQL security function.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border-b-0 py-2">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline text-gray-200 hover:text-white">
              Is visitor tracking privacy-compliant?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-gray-400 leading-relaxed">
              Yes. AeroLink does not store raw visitor IP addresses in the database. Unique visitors are calculated using an irreversible, salted cryptographic hash, ensuring compliance with privacy standards like GDPR.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 4. BOTTOM CALL-TO-ACTION */}
      <section className="w-full max-w-4xl p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-gray-900 to-blue-950/40 border border-blue-500/20 text-center flex flex-col items-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to supercharge your links?
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          Create your account in seconds and unlock custom aliases, deep analytics, and link protection tools.
        </p>
        <Button
          onClick={() => navigate("/auth")}
          className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 text-sm"
        >
          Get Started Now
        </Button>
      </section>
    </div>
  );
}
