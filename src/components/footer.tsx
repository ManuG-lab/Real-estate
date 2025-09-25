export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RealEstateConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
