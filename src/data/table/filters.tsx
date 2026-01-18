export const FILTERS = [
  {
    columnId: "status",
    title: "Status",
    options: [
      { label: "Active", value: "1" },
      { label: "Pending", value: "0" },
      { label: "Inactive", value: "-1" },
    ],
  },
//   {
//     columnId: "role",
//     title: "Role",
//     options: roles.map((role) => ({ ...role })),
//   },
  {
    columnId: "subscription",
    title: "Subscription",
    options: [
      { label: "Free", value: "free" },
      { label: "Pro", value: "pro" },
    ],
  },
];

export const callTypes = new Map<any, string>([
  ["active", "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
  ["inactive", "bg-neutral-300/40 border-neutral-300"],
  ["banned", "bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300"],
  [
    "suspended",
    "bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10",
  ],
]);

export const roles = [
  {
    label: "Approved",
    value: 1,
  },
  {
    label: "Pending",
    value: 0,
  },
  {
    label: "Rejected",
    value: -1,
  },
] as const;