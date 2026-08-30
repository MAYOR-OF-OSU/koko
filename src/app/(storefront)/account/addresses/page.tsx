import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddressesPage() {
  return (
    <div className="max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold">Delivery address</h2>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="street">Street</Label>
        <Input id="street" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" />
        </div>
      </div>
      <Button className="btn-fill" disabled>
        Save address
      </Button>
      <p className="text-xs text-muted-foreground">Saving is enabled once checkout goes live.</p>
    </div>
  );
}
