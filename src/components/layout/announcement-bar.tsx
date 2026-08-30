import { getAnnouncements } from "@/lib/site-content";
import { AnnouncementBarClient } from "@/components/layout/announcement-bar-client";

export async function AnnouncementBar() {
  const messages = await getAnnouncements();
  if (messages.length === 0) return null;
  return <AnnouncementBarClient messages={messages} />;
}
