import {useRef, useState} from "react";
import {QRCode} from "react-qrcode-logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Download, Copy, Check, QrCode} from "lucide-react";

export default function QrModal({isOpen, onOpenChange, url, title}) {
  const qrRef = useRef(null);
  const [size, setSize] = useState(250);
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const handleDownload = () => {
    try {
      const canvas = qrRef.current?.canvasRef?.current;
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `aerolink-qr-${title ? title.toLowerCase().replace(/[^a-z0-9]/g, "-") : "code"}.png`;
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col items-center text-center">
        <DialogHeader className="w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <QrCode className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-xl font-bold">QR Code Studio</DialogTitle>
          </div>
          <p className="text-sm text-gray-400 truncate max-w-xs mx-auto">
            {title || url}
          </p>
        </DialogHeader>

        {/* QR Preview Box */}
        <div className="p-4 bg-white rounded-xl shadow-lg my-4 flex items-center justify-center">
          <QRCode
            ref={qrRef}
            value={url}
            size={size}
            eyeRadius={8}
            qrStyle="squares"
            bgColor="#FFFFFF"
            fgColor="#0F172A"
          />
        </div>

        {/* Size Selection */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400 font-medium">Export Size:</span>
          {[150, 250, 400].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                size === s
                  ? "bg-blue-600 text-white border-blue-500 font-semibold"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 w-full justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyLink}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1 text-emerald-400" />
                Copied Link!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy URL
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleDownload}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
