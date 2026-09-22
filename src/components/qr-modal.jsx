import {useRef, useState} from "react";
import {QRCode} from "react-qrcode-logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Download, Copy, Check, QrCode, Sparkles} from "lucide-react";

export default function QrModal({isOpen, onOpenChange, url, title}) {
  const qrRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [size, setSize] = useState(250);
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const handleDownload = () => {
    try {
      const canvas =
        qrRef.current?.canvasRef?.current ||
        previewContainerRef.current?.querySelector("canvas");
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `aerolink-qr-${title ? title.toLowerCase().replace(/[^a-z0-9]/g, "-") : "code"}-${size}px.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download QR code:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeOptions = [
    {px: 150, label: "Small (150px)"},
    {px: 250, label: "Medium (250px)"},
    {px: 400, label: "Large (400px)"},
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-surface border-border-strong p-6 shadow-2xl">
        <DialogHeader className="gap-1 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <QrCode className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              QR Code Studio
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {title ? `Vector QR asset for "${title}"` : url}
          </p>
        </DialogHeader>

        {/* Studio Split Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-2">
          {/* Left Column: QR Canvas Preview */}
          <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl shadow-lg border border-slate-200">
            <div
              ref={previewContainerRef}
              className="w-full max-w-[220px] max-h-[220px] flex items-center justify-center [&_canvas]:max-w-full [&_canvas]:max-h-[220px] [&_canvas]:h-auto"
            >
              <QRCode
                ref={qrRef}
                value={url}
                size={size}
                eyeRadius={6}
                qrStyle="squares"
                bgColor="#FFFFFF"
                fgColor="#0B0E14"
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3 font-medium">
              Output: {size} × {size} px
            </span>
          </div>

          {/* Right Column: Controls & Actions */}
          <div className="space-y-4">
            {/* Short Link Display */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground">Target URL</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated border border-border-subtle text-xs">
                <span className="font-mono text-primary truncate max-w-[190px]">
                  {url}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground">Resolution</span>
              <div className="grid grid-cols-3 gap-1.5">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.px}
                    type="button"
                    onClick={() => setSize(opt.px)}
                    className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium transition-all ${
                      size === opt.px
                        ? "bg-primary/10 text-primary border-primary font-semibold shadow-xs"
                        : "bg-surface-elevated text-muted-foreground border-border-subtle hover:text-foreground hover:border-border-strong"
                    }`}
                  >
                    {opt.px}px
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Note */}
            <div className="p-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>Browser-rendered on demand. Zero cloud storage latency.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-1 text-xs border-border-subtle hover:bg-surface-elevated"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDownload}
                className="flex-1 bg-primary hover:bg-blue-500 text-white text-xs font-medium gap-1.5 shadow-sm shadow-blue-500/25"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
