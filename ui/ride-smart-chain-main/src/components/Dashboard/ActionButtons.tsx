// This is the code for your frontend (e.g., ActionButtons.tsx)
import { Button } from "@/components/ui/button";
import { Upload, Wallet, Gift } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react"; // <-- Make sure this is imported

export const ActionButtons = () => {
  // --- NEW CODE ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    // This clicks the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return; // User cancelled
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const formData = new FormData();
    // This 'rideData' key MUST match the one in your backend multer code
    formData.append("rideData", file);

    const uploadToast = toast.loading("Uploading ride data file...");

    try {
      const response = await fetch(`${backendUrl}/api/score`, {
        method: 'POST',
        body: formData, // Send the file
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      toast.success(`Score calculated: ${result.safetyScore}`, {
        id: uploadToast,
        description: `Your ride safety score is ${result.safetyScore}/100.`
      });

    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error("Upload failed.", {
        id: uploadToast,
        description: "Could not process your ride data file."
      });
    }

    // Clear the input value so the user can upload the same file again
    event.target.value = '';
  };
  // --- END OF NEW CODE ---

  const handleWalletConnect = () => {
    toast.info("Wallet connection coming soon!", {
      description: "Connect your Web3 wallet to claim rewards"
    });
  };

  const handleClaimRewards = () => {
    toast.success("Rewards claimed!", {
      description: "150 SafeRide Tokens added to your wallet"
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {/* This button now triggers the hidden input */}
      <Button
        size="lg"
        className="w-full h-auto py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
        onClick={handleUploadClick}
      >
        <Upload className="w-5 h-5 mr-2" />
        Upload Ride Data
      </Button>

      {/* This is the new hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv, .json, .txt" // You can change what file types are allowed
      />

      <Button
        size="lg"
        className="w-full h-auto py-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg"
        onClick={handleWalletConnect}
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect Wallet
      </Button>

      <Button
        size="lg"
        className="w-full h-auto py-6 bg-gradient-to-r from-accent to-amber-600 hover:opacity-90 text-accent-foreground font-semibold text-lg gold-glow"
        onClick={handleClaimRewards}
      >
        <Gift className="w-5 h-5 mr-2" />
        Claim Rewards
      </Button>
    </div>
  );
};
