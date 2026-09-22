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
  ShieldCheck,
  Clock,
  QrCode,
  ArrowRight,
  Lock,
  CheckCircle2,
  Globe,
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
      setUrlError("Please enter a destination URL to shorten.");
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
      <section className="w-full max-w-4xl text-center flex flex-col items-center pt-10 sm:pt-16">
        {/* Subtle Release Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border-subtle text-foreground text-xs font-medium mb-6 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground">AeroLink Platform</span>
          <span className="text-border-strong">•</span>
          <span className="text-primary font-medium">SaaS Link Operations</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.12]">
          Short links with <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
            more control.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Create, protect, and understand every link from one workspace. Built with
          cryptographic slugging, passcode gates, and privacy-preserving visitor telemetry.
        </p>

        {/* Interactive URL Shortener Input */}
        <form
          onSubmit={handleShorten}
          className="w-full max-w-2xl bg-surface border border-border-strong rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Paste a long destination URL (e.g. https://github.com/...)"
              value={longUrl}
              onChange={(e) => {
                setLongUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              className="h-11 bg-surface-elevated border-border-subtle text-xs pl-3.5 pr-3.5 rounded-xl focus-visible:ring-primary text-foreground placeholder:text-muted-foreground/60"
            />
          </div>
          <Button
            type="submit"
            className="h-11 px-6 bg-primary hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>Shorten link</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>

        {urlError && (
          <p className="text-xs text-rose-400 mt-2 font-medium">{urlError}</p>
        )}

        <div className="flex items-center gap-6 mt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free forever tier
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Server-side security
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" /> Vector QR studio
          </span>
        </div>
      </section>

      {/* 2. AUTHENTIC DASHBOARD PREVIEW */}
      <section id="analytics" className="w-full max-w-5xl px-2">
        <div className="rounded-2xl border border-border-strong bg-surface p-2 shadow-2xl shadow-black/60 overflow-hidden">
          {/* Mock Browser Header */}
          <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between bg-surface-elevated/70 rounded-t-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] text-muted-foreground font-mono ml-2">
                app.aerolink.in/dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Telemetry Connected</span>
            </div>
          </div>

          {/* Interactive UI Dashboard Preview */}
          <div className="p-4 sm:p-6 bg-background space-y-4">
            {/* Metric row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                <span className="text-[11px] text-muted-foreground block">Total Clicks</span>
                <span className="text-lg font-bold font-mono text-foreground">12,840</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                <span className="text-[11px] text-muted-foreground block">Active Links</span>
                <span className="text-lg font-bold font-mono text-emerald-400">18 / 20</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                <span className="text-[11px] text-muted-foreground block">Unique Visitors</span>
                <span className="text-lg font-bold font-mono text-violet-400">9,412</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border-subtle">
                <span className="text-[11px] text-muted-foreground block">Clicks Today</span>
                <span className="text-lg font-bold font-mono text-amber-400">428</span>
              </div>
            </div>

            {/* Preview link row */}
            <div className="p-3.5 bg-surface border border-border-subtle rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <span>Developer Portfolio 2026</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Active
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                      Protected
                    </span>
                  </div>
                  <span className="font-mono text-primary text-[11px]">
                    aerolink.in/portfolio
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold text-foreground text-xs">
                  3,124 <span className="font-sans font-normal text-muted-foreground">clicks</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="h-7 text-xs bg-surface-elevated hover:bg-surface border border-border-subtle text-foreground"
                >
                  Inspect
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CAPABILITIES (VARIED LAYOUT BENTO GRID) */}
      <section id="features" className="w-full max-w-5xl space-y-8">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Engineered for precision and control
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            Every feature is designed to give you complete governance over routing, security, and attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Passcode Protection */}
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-all flex flex-col justify-between space-y-4">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Passcode Protected Links
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Require a password before redirecting visitors. Verified server-side via PostgreSQL RPC so password hashes are never exposed.
              </p>
            </div>
            <div className="text-[11px] font-mono text-violet-400 bg-violet-500/10 p-2 rounded-lg border border-violet-500/20">
              RPC verify_link_password()
            </div>
          </div>

          {/* Card 2: Lifecycle Governance */}
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-all flex flex-col justify-between space-y-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Expiration Dates & Quota Caps
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Schedule automatic link expiration timestamps or limit total allowed visits. The gateway displays a clean paused screen once reached.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              Cap: 50 visits • ISO timestamps
            </div>
          </div>

          {/* Card 3: Client-Side QR Studio */}
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle hover:border-border-strong transition-all flex flex-col justify-between space-y-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Vector QR Code Studio
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Render crisp QR assets in-browser without cloud storage upload latency. Download PNGs in 150px, 250px, or 400px resolutions.
              </p>
            </div>
            <div className="text-[11px] font-mono text-primary bg-primary/10 p-2 rounded-lg border border-primary/20">
              150px • 250px • 400px PNG
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & PRIVACY SECTION */}
      <section id="security" className="w-full max-w-5xl p-6 sm:p-8 rounded-2xl bg-surface border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            <span>GDPR-Compliant Telemetry</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Privacy-first click attribution
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AeroLink does not store raw visitor IP addresses. Unique visitors are calculated using an irreversible, salted cryptographic hash (`SHA256(IP + UserAgent)`), protecting visitor confidentiality while delivering rich engagement metrics.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-blue-500 text-white text-xs font-medium h-9 px-5 shadow-sm shadow-blue-500/25"
          >
            Create your account
          </Button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            View GitHub architecture
          </a>
        </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <section id="faq" className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Common questions about AeroLink routing, security, and privacy.
          </p>
        </div>

        <Accordion
          type="multiple"
          className="w-full divide-y divide-border-subtle border-t border-b border-border-subtle"
        >
          <AccordionItem value="faq-1" className="border-b-0 py-1">
            <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary">
              How does AeroLink prevent short-code collisions?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              AeroLink generates 7-character Base62 slugs using the native Web Crypto API (`crypto.getRandomValues`), producing over 3.5 trillion possible permutations. The database enforces uniqueness, and the service layer includes automated collision retry handling.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border-b-0 py-1">
            <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary">
              How does password verification work without exposing hashes?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              When a visitor enters a passcode, the client hashes it with SHA-256 and calls the PostgreSQL function `verify_link_password` using `SECURITY DEFINER` privileges. Only a boolean result crosses the network; the database hash is never sent to the client browser.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border-b-0 py-1">
            <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary">
              Can I export my telemetry data?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Yes. Both the individual link analytics view and the global workspace dashboard feature one-click CSV export, allowing you to download timestamped click records for reporting in Excel or BI tools.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 6. CONCISE FINAL CTA */}
      <section className="w-full max-w-3xl p-8 rounded-2xl bg-surface border border-border-strong text-center flex flex-col items-center space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Ready to manage your links with precision?
        </h2>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          Join thousands of developers and creators using AeroLink for fast, protected, and insightful short URLs.
        </p>
        <Button
          onClick={() => navigate("/auth")}
          className="h-10 px-6 bg-primary hover:bg-blue-500 text-white text-xs font-medium rounded-xl shadow-md shadow-blue-500/25 mt-2"
        >
          Start shortening links
        </Button>
      </section>
    </div>
  );
}
