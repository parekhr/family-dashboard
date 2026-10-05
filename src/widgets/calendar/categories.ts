import type { Category } from './useCalendarData'

export function getCategoryText(categories: Category[], categoryId: string): string {
    return categories.find(category => category.id === categoryId)?.name ?? ''
}

export function getCategoryColor(categories: Category[], categoryId: string): string | undefined {
    return categories.find(category => category.id === categoryId)?.color
}
