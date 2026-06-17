import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
