"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { setUserRole, createStaffUser } from "@/server/actions/staff";
import { ROLES, STAFF_ROLES, ROLE_LABEL } from "@/lib/roles";
import { Field, TextInput, Select, SaveButton, useAction } from "@/components/admin/form";
import { Panel, CardHeading, Table, THead, TH, TR, TD } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

function RoleSelect({ user, isSelf }: { user: StaffUser; isSelf: boolean }) {
  const router = useRouter();
  const { pending, run } = useAction((role: string) => setUserRole(user.id, role), {
    success: "Role updated",
    onDone: () => router.refresh(),
  });
  return (
    <Select
      className="max-w-40 capitalize"
      defaultValue={user.role}
      disabled={pending || isSelf}
      title={isSelf ? "You can't change your own role" : undefined}
      onChange={(e) => run(e.target.value)}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABEL[r]}
        </option>
      ))}
    </Select>
  );
}

function AddStaffForm() {
  const router = useRouter();
  const [v, setV] = React.useState({ name: "", email: "", password: "", role: "cashier" });
  const { pending, run } = useAction(() => createStaffUser(v), {
    success: "Team member added",
    onDone: () => {
      setV({ name: "", email: "", password: "", role: "cashier" });
      router.refresh();
    },
  });
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <Panel>
      <CardHeading title="Add a team member" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <TextInput value={v.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={v.email} onChange={(e) => set("email", e.target.value)} required />
          </Field>
          <Field label="Temporary password" hint="Share it with them — they can change it in their account">
            <TextInput
              type="text"
              value={v.password}
              onChange={(e) => set("password", e.target.value)}
              required
              minLength={8}
              placeholder="at least 8 characters"
            />
          </Field>
          <Field label="Role">
            <Select value={v.role} onChange={(e) => set("role", e.target.value)}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <SaveButton pending={pending}>
          <UserPlus className="size-3.5" /> Create account
        </SaveButton>
      </form>
    </Panel>
  );
}

export function StaffManager({ users, selfId }: { users: StaffUser[]; selfId: string }) {
  const staff = users.filter((u) => u.role !== "client");
  const customers = users.filter((u) => u.role === "client");

  return (
    <div className="space-y-6">
      <AddStaffForm />

      <Panel>
        <CardHeading title={`Team (${staff.length})`} />
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Joined</TH>
              <TH>Role</TH>
            </TR>
          </THead>
          <tbody>
            {staff.map((u) => (
              <TR key={u.id}>
                <TD className="font-medium">
                  {u.name}
                  {u.id === selfId && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                </TD>
                <TD className="text-muted-foreground">{u.email}</TD>
                <TD className="text-muted-foreground">{formatDate(u.createdAt)}</TD>
                <TD>
                  <RoleSelect user={u} isSelf={u.id === selfId} />
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Panel>

      <Panel>
        <CardHeading title={`Customers (${customers.length})`} />
        <p className="mb-3 text-sm text-muted-foreground">
          Promote a customer to a staff role if they join the team.
        </p>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Joined</TH>
              <TH>Role</TH>
            </TR>
          </THead>
          <tbody>
            {customers.slice(0, 100).map((u) => (
              <TR key={u.id}>
                <TD className="font-medium">{u.name}</TD>
                <TD className="text-muted-foreground">{u.email}</TD>
                <TD className="text-muted-foreground">{formatDate(u.createdAt)}</TD>
                <TD>
                  <RoleSelect user={u} isSelf={u.id === selfId} />
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
