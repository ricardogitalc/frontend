export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="container mx-auto mt-20">{children}</main>;
}
