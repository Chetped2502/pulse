import Link from "next/link";

const links = [
  { href: "/dashboard", label: "แดชบอร์ด" },
  { href: "/bookmarks", label: "บันทึกไว้" },
  { href: "/settings", label: "ตั้งค่า" },
];

export function NavBar() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-primary">Pulse</span>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
