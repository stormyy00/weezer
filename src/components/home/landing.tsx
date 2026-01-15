import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";

const Landing = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-white via-white/80 to-white text-black">
        <h1 className="text-5xl font-bold">Your <span className="text-ucr-gold">Unified</span> Events Hub for <span className="text-ucr-blue">Highlanders</span></h1>
          <div>
            <p className="mt-4 text-center text-lg max-w-2xl">
                Discover, explore, and stay updated with all campus events in one convenient place. 
                Join the community and never miss out on exciting happenings at UCR!
            </p>
          </div>
        <Button size="lg" onClick={() => navigate({ to: "/events" })} className="mt-6 bg-ucr-blue text-white rounded-lg cursor-pointer shadow-lg hover:bg-ucr-blue transition-colors duration-300">
            Explore Events
        </Button>
    </div>
  )
}

export default Landing