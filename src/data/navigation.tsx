import {

  User,
  Logs,
  ChartBarBig,
  Notebook,
  Laptop,
  Home,
  MessageCircle,
} from "lucide-react";
import { JSX } from "react";
interface Tab {
  name: string;
  link: string;
  icon: JSX.Element;
}

interface Collapsible {
  expand: boolean;
  tabs: Tab[];
}

type Tabs = Record<string, Collapsible>;

export const TABS: Tabs = {
  admin: {
    expand: true,
    tabs: [
        {
        name: "Home",
        link: "/admin",
        icon: <Home />,
      },
      {
        name: "Organizations",
        link: "/admin/organizations",
        icon: <Laptop />,
      },
      {
        name: "Events",
        link: "/admin/events",
        icon: <User />,
      },
      {
        name: "Raw Posts",
        link: "/admin/raw-posts",
        icon: <ChartBarBig />,
      },
      {
        name: "Jobs",
        link: "/admin/jobs",
        icon: <Notebook />,
      },
      {
        name: "Queue",
        link: "/admin/queue",
        icon: <User />,
      },
      {
        name: "Messages",
        link: "/admin/messages",
        icon: <MessageCircle />,
      },
      {
        name: "Statistics",
        link: "/admin/statistics",
        icon: <Logs />,
      }
    ],
  },
};
