import React, { useState, useRef } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AvatarUploadProps {
    currentAvatar?: string
    userName?: string
    onAvatarChange: (avatarDataUrl: string | null) => void
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
}

const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatar,
    userName,
    onAvatarChange,
    className,
    size = 'lg'
}) => {
    const [preview, setPreview] = useState<string | null>(currentAvatar || null)
    const [isHovering, setIsHovering] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Пожалуйста, выберите изображение')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Размер изображения не должен превышать 2MB')
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result as string
            setPreview(result)
            onAvatarChange(result)
            toast.success('Аватар обновлен')
        }
        reader.readAsDataURL(file)
    }

    const handleRemove = () => {
        setPreview(null)
        onAvatarChange(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        toast.info('Аватар удален')
    }

    const getInitials = (name?: string) => {
        if (!name) return ''
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => fileInputRef.current?.click()}
            >
                {/* Avatar Circle */}
                <div
                    className={cn(
                        sizeClasses[size],
                        'rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center',
                        'border-2 border-dashed border-primary/30 transition-all duration-200',
                        'group-hover:border-primary group-hover:scale-105',
                        preview && 'border-solid border-primary/50'
                    )}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="Аватар"
                            className="w-full h-full object-cover"
                        />
                    ) : userName ? (
                        <span className={cn(
                            'font-semibold text-primary',
                            size === 'sm' && 'text-lg',
                            size === 'md' && 'text-xl',
                            size === 'lg' && 'text-2xl'
                        )}>
                            {getInitials(userName)}
                        </span>
                    ) : (
                        <User className={cn(iconSizeClasses[size], 'text-primary/50')} />
                    )}
                </div>

                {/* Overlay on hover */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-200',
                        isHovering ? 'opacity-100' : 'opacity-0'
                    )}
                >
                    <Camera className={cn(iconSizeClasses[size], 'text-white')} />
                </div>

                {/* Remove button */}
                {preview && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleRemove()
                        }}
                        className={cn(
                            'absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground',
                            'flex items-center justify-center shadow-lg',
                            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                            'hover:bg-destructive/90'
                        )}
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="w-4 h-4" />
                {preview ? 'Изменить фото' : 'Загрузить фото'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                JPG, PNG или GIF. Макс. 2MB.
            </p>
        </div>
    )
}
