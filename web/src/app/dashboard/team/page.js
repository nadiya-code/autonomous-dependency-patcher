import { Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";

export default function Team() {
  return (
    <div>
      <PageHeader title="Team" />
      <EmptyState icon={Users} title="Coming soon" text="Organizations and team members are not built yet." />
    </div>
  );
}
