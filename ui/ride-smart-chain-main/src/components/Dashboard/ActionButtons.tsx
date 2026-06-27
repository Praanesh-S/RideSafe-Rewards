import { Button } from "@/components/ui/button";
import { Upload, Wallet, Gift } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";
import { type DashboardData, uploadRideFile } from "@/lib/ridesafe-api";
import { calculateLocalDashboard } from "@/lib/ridesafe-local";

interface ActionButtonsProps {
  currentDashboard?: DashboardData;
  onDashboardUpdate?: (dashboard: DashboardData) => void;
}

export const ActionButtons = ({ currentDashboard, onDashboardUpdate }: ActionButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const uploadToast = toast.loading("Uploading ride data file...");

    try {
      const result = await uploadRideFile(file);
      onDashboardUpdate?.(result.dashboard);

      toast.success(`Score calculated: ${result.safetyScore}`, {
        id: uploadToast,
        description: `Your ride safety score is ${result.safetyScore}/100.`
      });

    } catch (error) {
      console.error("Failed to upload file to backend:", error);

      if (currentDashboard) {
        try {
          const rawText = await file.text();
          const localResult = calculateLocalDashboard(currentDashboard, file.name, rawText);
          onDashboardUpdate?.(localResult.dashboard);

          toast.success(`Score calculated (Local Fallback): ${localResult.safetyScore}`, {
            id: uploadToast,
            description: `Offline mode: calculated safety score is ${localResult.safetyScore}/100.`
          });
          event.target.value = '';
          return;
        } catch (fallbackError) {
          console.error("Local fallback calculation failed:", fallbackError);
        }
      }

      toast.error("Upload failed.", {
        id: uploadToast,
        description: "Could not process your ride data file."
      });
    }

    event.target.value = '';
  };

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
      <Button
        size="lg"
        className="w-full h-auto py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
        onClick={handleUploadClick}
      >
        <Upload className="w-5 h-5 mr-2" />
        Upload Ride Data
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv, .json, .txt"
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
