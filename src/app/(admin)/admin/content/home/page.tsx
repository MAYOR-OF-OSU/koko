import { AdminPage } from "@/components/admin/ui";
import { getSetting } from "@/lib/site-content";
import { HomeContentForms } from "@/components/admin/home-content-forms";

export const dynamic = "force-dynamic";

export default async function AdminHomeContentPage() {
  const [hero, marquee, stats, promo, story] = await Promise.all([
    getSetting("home.hero"),
    getSetting("home.marquee"),
    getSetting("home.stats"),
    getSetting("home.promo"),
    getSetting("home.story"),
  ]);

  return (
    <AdminPage title="Home content" description="Everything on the homepage, editable. Changes go live on save.">
      <HomeContentForms hero={hero} marquee={marquee} stats={stats} promo={promo} story={story} />
    </AdminPage>
  );
}
