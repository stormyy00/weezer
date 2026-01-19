import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <img
        src={theme === "light" ? "/assets/light.png" : "/assets/dark.png"}
        alt="Campus scene"
        className="absolute inset-0 h-full w-full object-cover"
      />


      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6">
        <div
          className={cn(
            "max-w-xl text-center",
            "animate-in fade-in duration-700",
            "rounded-2xl px-4 py-6 sm:px-2 sm:py-8",
          )}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-white text-hero-shadow">
            Your{" "}
            <span className="text-ucr-gold">Unified</span>{" "}
            Events Hub for{" "}
            <span className="text-[#1039b5] dark:text-ucr-blue brightness-125">Highlanders</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/90 font-medium bg-black/40 inline-block px-3 py-2 rounded-lg text-hero-shadow">
            Discover, explore, and stay updated with all campus events in one convenient place.
            Join the community and never miss out on exciting happenings at UCR!
          </p>

          <Button
            size="lg"
            onClick={() => navigate({ to: "/events" })}
            className="mt-6 bg-[#1039b5] text-white rounded-xl shadow-lg hover:bg-ucr-blue transition cursor-pointer duration-300"
          >
            Explore Events
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
