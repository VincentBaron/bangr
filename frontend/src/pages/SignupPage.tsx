import AuthDialog from "@/components/AuthDialog";

export default function SignupPage() {
  return (
    <div>
      <AuthDialog
        isOpen={!isLoggedIn}
        onClose={() => setIsLoggedIn(true)}
        onSignUp={() => setIsLoggedIn(true)}
      />
    </div>
  );
}
