import { DevizlyLogo } from "@/components/devizly-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <DevizlyLogo width={180} height={46} />
          <p className="mt-3 text-sm text-muted-foreground">
            Créez vos devis professionnels avec l&apos;IA
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
