import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "AcademiaHQ Blog" },
      { name: "description", content: "Sign in to AcademiaHQ to manage your articles and dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  
  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  
  // Sign up form state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const google = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) { 
        toast.error(result.error.message || "Google sign in failed"); 
        return; 
      }
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    
    // Validation
    if (!signInEmail.trim()) {
      setSignInError("Email is required");
      return;
    }
    if (!validateEmail(signInEmail)) {
      setSignInError("Please enter a valid email address");
      return;
    }
    if (!signInPassword) {
      setSignInError("Password is required");
      return;
    }
    if (!validatePassword(signInPassword)) {
      setSignInError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: signInEmail.trim(), 
        password: signInPassword 
      });
      if (error) {
        setSignInError(error.message || "Sign in failed");
        toast.error(error.message || "Sign in failed");
        return;
      }
      toast.success("Signed in successfully!");
      navigate({ to: "/admin" });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign in failed";
      setSignInError(errorMsg);
      console.error(err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    
    // Validation
    if (!signUpName.trim()) {
      setSignUpError("Full name is required");
      return;
    }
    if (signUpName.trim().length < 2) {
      setSignUpError("Full name must be at least 2 characters");
      return;
    }
    if (!signUpEmail.trim()) {
      setSignUpError("Email is required");
      return;
    }
    if (!validateEmail(signUpEmail)) {
      setSignUpError("Please enter a valid email address");
      return;
    }
    if (!signUpPassword) {
      setSignUpError("Password is required");
      return;
    }
    if (!validatePassword(signUpPassword)) {
      setSignUpError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: { 
          data: { full_name: signUpName.trim() }, 
          emailRedirectTo: window.location.origin + "/admin" 
        },
      });
      if (error) {
        setSignUpError(error.message || "Sign up failed");
        toast.error(error.message || "Sign up failed");
        return;
      }
      toast.success("Account created! Check your email to confirm your account.");
      // Reset form
      setSignUpName("");
      setSignUpEmail("");
      setSignUpPassword("");
      // Switch back to sign in tab
      setActiveTab("signin");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign up failed";
      setSignUpError(errorMsg);
      console.error(err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear errors when switching tabs
    setSignInError("");
    setSignUpError("");
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-bold text-lg">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          Academia<span className="text-primary">HQ</span>
        </Link>
        <div className="mt-8 neu p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <Button type="button" variant="outline" className="w-full neu-interactive" onClick={google} disabled={loading}>
                Continue with Google
              </Button>
              <Divider />
              <form onSubmit={signIn} className="space-y-3">
                {signInError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {signInError}
                  </div>
                )}
                <Field label="Email">
                  <Input 
                    type="email" 
                    required 
                    value={signInEmail} 
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      setSignInError("");
                    }} 
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </Field>
                <Field label="Password">
                  <Input 
                    type="password" 
                    required 
                    minLength={6} 
                    value={signInPassword} 
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      setSignInError("");
                    }} 
                    placeholder="••••••"
                    disabled={loading}
                  />
                </Field>
                <Button type="submit" className="w-full neu-interactive" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <Button type="button" variant="outline" className="w-full neu-interactive" onClick={google} disabled={loading}>
                Continue with Google
              </Button>
              <Divider />
              <form onSubmit={signUp} className="space-y-3">
                {signUpError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {signUpError}
                  </div>
                )}
                <Field label="Full name">
                  <Input 
                    type="text"
                    required 
                    value={signUpName} 
                    onChange={(e) => {
                      setSignUpName(e.target.value);
                      setSignUpError("");
                    }} 
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </Field>
                <Field label="Email">
                  <Input 
                    type="email" 
                    required 
                    value={signUpEmail} 
                    onChange={(e) => {
                      setSignUpEmail(e.target.value);
                      setSignUpError("");
                    }} 
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </Field>
                <Field label="Password">
                  <Input 
                    type="password" 
                    required 
                    minLength={6} 
                    value={signUpPassword} 
                    onChange={(e) => {
                      setSignUpPassword(e.target.value);
                      setSignUpError("");
                    }} 
                    placeholder="••••••"
                    disabled={loading}
                  />
                </Field>
                <Button type="submit" className="w-full neu-interactive" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">By continuing you agree to our Terms and Privacy Policy.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative py-2 text-center">
      <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
      <span className="bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">or</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
