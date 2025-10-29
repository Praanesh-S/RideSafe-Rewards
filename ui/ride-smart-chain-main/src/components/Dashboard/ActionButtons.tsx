import { Button } from "@/components/ui/button";
import { Upload, Wallet, Gift } from "lucide-react";
import { toast } from "sonner";

export const ActionButtons = () => {
  const handleUpload = () => {
    toast.info("Upload feature coming soon!", {
      description: "Connect your ride telemetry data"
    });
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
        onClick={handleUpload}
      >
        <Upload className="w-5 h-5 mr-2" />
        Upload Ride Data
      </Button>
      
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
