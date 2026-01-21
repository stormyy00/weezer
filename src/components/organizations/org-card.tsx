import { OrganizationSocials } from "@/fn/organization"
import { SOCIALS } from "@/data/socials"
import { cn } from "@/lib/utils"
import { useNavigate } from "@tanstack/react-router"

type organizationProps = {
    organization: {
        id: string
        name: string
        logoUrl: string | null
        bio?: string | null
        socials?: OrganizationSocials | null
    }
}

const OrgCard = ({ organization }: organizationProps) => {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        "group relative w-full rounded-2xl overflow-hidden",
        "border transition-all duration-300",
        "hover:scale-[1.01]",
        "bg-white border-gray-200 shadow-sm hover:shadow-md",
        "dark:bg-[#141827] dark:border-white/10 dark:shadow-black/30 dark:hover:shadow-xl"
      )}
    >
      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-center gap-1">
         <div className="w-18 h-18 shrink-0 flex items-center justify-center overflow-hidden p-2">
            <img
              src={organization.logoUrl || ""}
              alt={organization.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-1">
              {organization.name}
            </div>
        {organization.socials && (
            <div className="flex gap-2">
            {Object.entries(organization.socials)
              .map(([platform, url]) => {
                  const SocialIcon = SOCIALS[platform]
                  return (
                      <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition"
                      >
                  <span className="text-2xl text-ucr-blue dark:text-ucr-yellow">
                    <SocialIcon />
                  </span>
                </a>
              ) })}
          </div>
        )}
          </div>
        </div>
        
        <div>
            <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-3 px-2">
              {organization.bio || "No description yet."}
            </p>
        </div>

<button
  onClick={() => {
    navigate({ to: `/organizations/${organization.id}` })
  }}
  className={cn(
    "mt-1 w-full py-2 rounded-lg text-sm font-medium transition cursor-pointer",
    "bg-ucr-blue text-white font-semibold hover:brightness-95",
    "dark:bg-[#FFB81C] dark:text-black"
  )}
>
  View Organization →
</button>
      </div>
    </div>
  )
}

export default OrgCard
