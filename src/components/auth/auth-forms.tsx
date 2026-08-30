"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, signUp, authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function useNext() {
  const params = useSearchParams();
  return params.get("next") ?? "/account";
}

/* ------------------------------------------------------------------ */

function AuthField({
  id,
  label,
  type = "text",
  icon: Icon,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
  placeholder?: string;
}) {
  const isPassword = type === "password";
  const [show, setShow] = React.useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[0.8rem] text-foreground/80">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          name={id}
          type={isPassword && show ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          className={cn(
            "w-full rounded-md border border-border bg-card py-2.5 pl-10 text-sm outline-none transition-colors focus:border-foreground",
            isPassword ? "pr-10" : "pr-3",
          )}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-muted-foreground transition hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h1 className="font-heading text-3xl">{title}</h1>
      <div className="mx-auto my-3 flex w-24 items-center gap-2">
        <span className="h-px flex-1 bg-border" />
        <span className="text-accent-gold">•</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-fill inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-3 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-background transition disabled:opacity-60"
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[0.68rem] uppercase tracking-widest text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleButton({ enabled, next }: { enabled: boolean; next: string }) {
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    if (!enabled) return;
    setPending(true);
    try {
      await signIn.social({ provider: "google", callbackURL: next });
    } catch {
      toast.error("Google sign-in isn't available right now.");
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled || pending}
      title={enabled ? undefined : "Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to enable"}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-card py-2.5 text-sm font-medium transition hover:bg-secondary disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
        </svg>
      )}
      Continue with Google
    </button>
  );
}

/* ------------------------------------------------------------------ */

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const next = useNext();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    try {
      const { data, error } = await signIn.email({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      if (error) {
        toast.error(error.message ?? "Could not sign in");
        return;
      }
      toast.success("Signed in");
      const role = (data?.user as { role?: string } | undefined)?.role;
      router.push(role === "admin" ? "/admin" : next);
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Is the database running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Heading title="Welcome Back" subtitle="Please sign in to your account" />
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField id="email" label="Email Address" type="email" icon={Mail} autoComplete="email" placeholder="Enter your email" />
        <AuthField id="password" label="Password" type="password" icon={Lock} autoComplete="current-password" placeholder="Enter your password" />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-rose-deep hover:underline">
            Forgot Password?
          </Link>
        </div>
        <SubmitButton pending={pending}>{pending ? "Signing in…" : "Login"}</SubmitButton>
      </form>
      <Divider />
      <GoogleButton enabled={googleEnabled} next={next} />
      <p className="text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <Link href="/register" className="font-medium text-rose-deep hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const next = useNext();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    try {
      const { error } = await signUp.email({
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      if (error) {
        toast.error(error.message ?? "Could not create account");
        return;
      }
      toast.success("Account created");
      router.push(next);
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Is the database running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Heading title="Create Account" subtitle="Save your details for faster checkout" />
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField id="name" label="Full Name" icon={User} autoComplete="name" placeholder="Enter your name" />
        <AuthField id="email" label="Email Address" type="email" icon={Mail} autoComplete="email" placeholder="Enter your email" />
        <AuthField id="password" label="Password" type="password" icon={Lock} autoComplete="new-password" placeholder="Create a password" />
        <SubmitButton pending={pending}>{pending ? "Creating…" : "Sign Up"}</SubmitButton>
      </form>
      <Divider />
      <GoogleButton enabled={googleEnabled} next={next} />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-deep hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setPending(true);
    try {
      // better-auth returns success even for unknown emails (no account enumeration).
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error(error.message ?? "Couldn't send the reset link. Try again.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Couldn't reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Heading title="Reset Password" subtitle="We'll email you a reset link" />
      {sent ? (
        <p className="rounded-md border border-border bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way. It expires in an hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthField id="email" label="Email Address" type="email" icon={Mail} autoComplete="email" placeholder="Enter your email" />
          <SubmitButton pending={pending}>{pending ? "Sending…" : "Send Reset Link"}</SubmitButton>
        </form>
      )}
      <p className="text-center text-sm">
        <Link href="/login" className="text-rose-deep hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const invalid = params.get("error");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token });
      if (error) {
        toast.error(error.message ?? "That reset link is invalid or has expired.");
        return;
      }
      toast.success("Password updated — sign in with your new password.");
      router.push("/login");
    } catch {
      toast.error("Couldn't reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (invalid || !token) {
    return (
      <div className="space-y-6">
        <Heading title="Link expired" subtitle="This reset link is no longer valid" />
        <p className="rounded-md border border-border bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
          Reset links expire after an hour. Request a fresh one to continue.
        </p>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-rose-deep hover:underline">
            Send a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Heading title="Set a new password" subtitle="Choose something you'll remember" />
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField id="password" label="New password" type="password" icon={Lock} autoComplete="new-password" placeholder="At least 8 characters" />
        <AuthField id="confirm" label="Confirm password" type="password" icon={Lock} autoComplete="new-password" placeholder="Re-enter it" />
        <SubmitButton pending={pending}>{pending ? "Saving…" : "Update password"}</SubmitButton>
      </form>
      <p className="text-center text-sm">
        <Link href="/login" className="text-rose-deep hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
