import { useState, useRef } from 'react'
import { CameraIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const classColors: Record<string, string> = {
    barbarian: '0 72% 51%',
    bard: '280 60% 55%',
    cleric: '45 85% 48%',
    druid: '142 71% 42%',
    sorcerer: '217 85% 55%',
    fighter: '25 95% 50%',
    wizard: '217 85% 55%',
    monk: '210 65% 52%',
    paladin: '45 85% 48%',
    ranger: '152 69% 38%',
    rogue: '220 14% 40%',
    warlock: '270 60% 55%',
}

interface CharacterAvatarProps {
    avatarUrl?: string
    name: string
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    onUpload?: (dataUrl: string) => Promise<void>
    onRemove?: () => Promise<void>
    editable?: boolean
}

const sizeMap = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-28 h-28 text-2xl',
}

export function CharacterAvatar({
    avatarUrl,
    name,
    className: classClassName,
    size = 'lg',
    onUpload,
    onRemove,
    editable = false,
}: CharacterAvatarProps) {
    const [uploading, setUploading] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const initials = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !onUpload) return

        if (!file.type.startsWith('image/')) return
        if (file.size > 2 * 1024 * 1024) return

        setUploading(true)
        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const result = reader.result as string

                const img = new Image()
                img.onload = async () => {
                    const MAX = 512
                    let w = img.width
                    let h = img.height
                    if (w > MAX || h > MAX) {
                        const ratio = Math.min(MAX / w, MAX / h)
                        w = Math.round(w * ratio)
                        h = Math.round(h * ratio)
                    }
                    const canvas = document.createElement('canvas')
                    canvas.width = w
                    canvas.height = h
                    const ctx = canvas.getContext('2d')
                    if (!ctx) return
                    ctx.drawImage(img, 0, 0, w, h)
                    const compressed = canvas.toDataURL('image/webp', 0.82)
                    await onUpload(compressed)
                    setUploading(false)
                    setShowMenu(false)
                }
                img.src = result
            }
            reader.readAsDataURL(file)
        } catch {
            setUploading(false)
        }

        e.target.value = ''
    }

    const handleRemove = async () => {
        if (!onRemove) return
        setUploading(true)
        try {
            await onRemove()
        } finally {
            setUploading(false)
            setShowMenu(false)
        }
    }

    const hslStr = classClassName && classColors[classClassName]
        ? `hsl(${classColors[classClassName]})`
        : 'hsl(var(--primary))'

    return (
        <div className="relative inline-block" style={{ width: 'fit-content' }}>
            <div
                className={`
                    relative rounded-full overflow-hidden border-[3px] shrink-0
                    ${sizeMap[size]}
                    ${editable ? 'cursor-pointer group' : ''}
                `}
                style={{ borderColor: hslStr }}
                onClick={editable ? () => setShowMenu(!showMenu) : undefined}
            >
                {uploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ArrowPathIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center font-cinzel font-bold text-primary-foreground"
                        style={{ background: `linear-gradient(135deg, hsl(${classColors[classClassName || ''] || 'var(--primary)'}), hsl(${classColors[classClassName || ''] || 'var(--primary)'} / 0.7))` }}
                    >
                        {initials}
                    </div>
                )}

                {editable && !uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-full">
                        <CameraIcon className="w-6 h-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>

            {editable && showMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-fade-in">
                    <div className="card py-2 px-1 shadow-lg min-w-[160px]">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-sm text-left"
                        >
                            <CameraIcon className="w-4 h-4" />
                            {avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
                        </button>
                        {avatarUrl && (
                            <button
                                onClick={handleRemove}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm text-destructive text-left"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Supprimer
                            </button>
                        )}
                    </div>
                    <div
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setShowMenu(false)}
                    />
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    )
}