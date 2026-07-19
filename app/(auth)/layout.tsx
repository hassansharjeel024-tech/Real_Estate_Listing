export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
