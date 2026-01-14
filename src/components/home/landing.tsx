import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";

const Landing = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-white via-white/80 to-white text-black">
        <h1 className="text-4xl font-bold">Your <span className="text-blue-900">Unified</span> UCR Events Hub</h1>
        <Button onClick={() => navigate({ to: "/events" })} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300">
            Explore Events
        </Button>
    </div>
  )
}

export default Landing