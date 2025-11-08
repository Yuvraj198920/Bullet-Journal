import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface RegisterFormProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

const TermsOfService = () => (
  <div className="p-4 text-sm">
    <h4 className="font-bold mb-2">Terms of Service</h4>
    <p>By creating an account, you agree to our terms and conditions. Please read them carefully.</p>
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>You must be at least 13 years old to use this service.</li>
      <li>You are responsible for maintaining the security of your account.</li>
      <li>We reserve the right to terminate accounts that violate our policies.</li>
    </ul>
  </div>
);

const PrivacyPolicy = () => (
  <div className="p-4 text-sm">
    <h4 className="font-bold mb-2">Privacy Policy</h4>
    <p>We are committed to protecting your privacy. Here’s how we handle your data:</p>
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>We collect your name and email for authentication purposes only.</li>
      <li>We do not share your personal information with third parties.</li>
      <li>All your journal data is encrypted and stored securely.</li>
    </ul>
  </div>
);


export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    form: "",
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = useMemo(() => [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "At least one uppercase letter" },
    { regex: /[a-z]/, text: "At least one lowercase letter" },
    { regex: /[0-9]/, text: "At least one number" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "At least one special character" },
  ], []);

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "name":
        if (!value.trim()) error = "Please enter your name";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        const unmetRequirements = passwordRequirements
          .filter(req => !req.regex.test(value))
          .map(req => req.text);
        if (unmetRequirements.length > 0) {
          error = `Password must contain: ${unmetRequirements.join(', ')}`;
        }
        break;
      case "confirmPassword":
        if (password !== value) error = "Passwords do not match";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, form: "" }));
    setSuccess(false);

    // Re-validate all fields on submit
    validateField("name", name);
    validateField("email", email);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    const hasErrors = Object.values(errors).some(error => error !== "");
    if (hasErrors || !agreedToTerms) {
      if (!agreedToTerms) {
        setErrors(prev => ({ ...prev, form: "You must agree to the terms to continue." }));
      }
      return;
    }

    setLoading(true);

    try {
      await onRegister(email, password, name);
      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreedToTerms(false);
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err instanceof Error ? err.message : "Failed to create account" }));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Account Created!
          </CardTitle>
          <CardDescription>
            A verification email has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Please check your inbox and click the verification link to activate your account.
            You can then sign in with your credentials.
          </p>
          <Alert>
            <AlertDescription>
              Note: In this development environment, email verification is automatically completed.
              You can sign in immediately.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onSwitchToLogin} className="w-full">
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Start your bullet journaling journey</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errors.form && (
            <Alert variant="destructive">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => validateField("name", e.target.value)}
              required
              disabled={loading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateField("email", e.target.value)}
              required
              disabled={loading}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validateField("password", e.target.value);
              }}
              required
              disabled={loading}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password}</p>
            ) : (
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                {passwordRequirements.map(req => (
                  <div key={req.text} className={`flex items-center transition-colors ${req.regex.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={(e) => validateField("confirmPassword", e.target.value)}
              required
              disabled={loading}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Popover>
                <PopoverTrigger>
                  <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <TermsOfService />
                </PopoverContent>
              </Popover>
              {" "}and{" "}
              <Popover>
                <PopoverTrigger>
                  <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PrivacyPolicy />
                </PopoverContent>
              </Popover>
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="px-1 h-auto"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Sign in
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}