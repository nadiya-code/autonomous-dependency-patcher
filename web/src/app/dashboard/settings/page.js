import { Settings } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <EmptyState icon={Settings} title="Coming soon" text="Account and billing settings are not built yet." />
    </div>
  );
}
