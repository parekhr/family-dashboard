import { Leaf, type LucideIcon, Snowflake, Flower, Sun, Ghost, Gift, Candy, TreePine } from 'lucide-react'

export type SeasonalTheme = {
    background: string
    header: string
    watermarkIcon: LucideIcon
    watermarkColor: string
    secondaryIcon?: LucideIcon
    secondaryColor?: string
}

const fall = {
        background: 'bg-fall-bg',
        header: 'bg-fall-header',
        watermarkIcon: Leaf,
        watermarkColor: 'text-fall-icon/10'
    }

    const winter = {
        background: 'bg-blue-50',
        header: 'bg-blue-100',
        watermarkIcon: Snowflake,
        watermarkColor: 'text-blue-500'
    }

    const spring = {
        background: 'bg-green-50',
        header: 'bg-green-100',
        watermarkIcon: Flower,
        watermarkColor: 'text-green-500'
    }

    const summer = {
        background: 'bg-yellow-50',
        header: 'bg-yellow-100',
        watermarkIcon: Sun,
        watermarkColor: 'text-yellow-500'
    }

    const halloween = {
        background: 'bg-halloween-bg',
        header: 'bg-halloween-header',
        watermarkIcon: Ghost,
        watermarkColor: 'text-halloween-icon/40',
        secondaryIcon: Candy,
        secondaryColor: 'text-halloween-icon2'
    }

    const christmas = {
        background: 'bg-christmas-bg',
        header: 'bg-christmas-header',
        watermarkIcon: TreePine,
        watermarkColor: 'text-christmas-icon/25',
        secondaryIcon: Gift,
        secondaryColor: 'text-christmas-icon2'
    }

const monthArray = [winter, winter, winter, spring, spring, summer, summer, summer, fall, halloween, fall, christmas]

export function getDefaultSeasonalTheme(month: number): SeasonalTheme {
    return monthArray[month - 1]
}