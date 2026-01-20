import { Mail } from "lucide-react";
import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaDiscord,
} from "react-icons/fa";
import { IoLogoFacebook } from "react-icons/io";
import { FaXTwitter } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";

export const SOCIALS: Record<string, React.ComponentType> = {
  instagram: FaInstagram,
  facebook: IoLogoFacebook,
  twitter: FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  website: CiGlobe,
  tiktok: FaTiktok,
  discord: FaDiscord,
  email: Mail,
};
