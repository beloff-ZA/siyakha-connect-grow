import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const GiveBackButton = () => {
  return (
    <Link
      to="/give-back"
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 bg-accent text-accent-foreground pl-3 pr-4 py-3 rounded-r-full shadow-lg hover:bg-accent/90 transition-colors group"
      aria-label="Give Back – Donate to Gift of the Givers"
    >
      <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-semibold hidden sm:inline">Give Back</span>
    </Link>
  );
};

export default GiveBackButton;
