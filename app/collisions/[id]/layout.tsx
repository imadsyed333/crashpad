export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function CollisionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
