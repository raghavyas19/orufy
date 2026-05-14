import { Link } from "react-router-dom";
import vectorIcon from "@/assets/Vector.png";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-1.5 font-bold text-xl tracking-tight">
      <span className={light ? "text-white" : "text-primary"}>Productr</span>
      <img src={vectorIcon} alt="Productr icon" className="h-5 w-5 object-contain" />
    </Link>
  );
}
