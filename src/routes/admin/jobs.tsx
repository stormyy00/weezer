import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/jobs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
scraped jobs which has the option to scrape highlander link with either a certain field or all fields dpenednsing on what the user wants
 scraped instagram with ability to enter one or multiple names to maniall scrape or run default scrape job which scrapes all but has a prompt are you sure you want to run this job as it may take a while
 manually run llm datapipeline generation allows us to run it or we can run it in the raw posts table but here gives us more indepth current progress of the job and ability to cancel if needed
  </div>
}
