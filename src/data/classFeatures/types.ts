// Aptitudes de classe par niveau (descriptions courtes FR)
export interface ClassFeature {
    name: string
    description: string
}

// Capacités de classe actionnables (trackées avec des ressources)
export interface ClassAction {
    key: string
    name: string
    description: string
    icon: string
    restoreOn: 'short' | 'long' | 'never'
}
