import { Leaf, type LucideIcon } from 'lucide-react'

export type SeasonalTheme = {
    background: string
    header: string
    watermarkIcon: LucideIcon
    watermarkColor: string
}

const fall = {
        background: 'bg-fall-bg',
        header: 'bg-fall-header',
        watermarkIcon: Leaf,
        watermarkColor: 'text-fall-icon'
    }

    const winter = {
        background: 'bg-blue-50',
        header: 'bg-blue-100',
        watermarkIcon: Leaf,
        watermarkColor: 'text-blue-500'
    }

    const spring = {
        background: 'bg-green-50',
        header: 'bg-green-100',
        watermarkIcon: Leaf,
        watermarkColor: 'text-green-500'
    }

    const summer = {
        background: 'bg-yellow-50',
        header: 'bg-yellow-100',
        watermarkIcon: Leaf,
        watermarkColor: 'text-yellow-500'
    }

    const halloween = {
        background: 'bg-black',
        header: 'bg-orange-100',
        watermarkIcon: Leaf,
        watermarkColor: 'text-orange-500'
    }

    const christmas = {
        background: 'bg-red-50',
        header: 'bg-green-100',
        watermarkIcon: Leaf,
        watermarkColor: 'text-red-500'
    }

const monthArray = [winter, winter, winter, spring, spring, summer, summer, summer, fall, halloween, fall, christmas]

export function getDefaultSeasonalTheme(month: number): SeasonalTheme {
    return monthArray[month - 1]
}