/**
 * Utility functions for HP bar color calculation
 * Used in encounter tracker to provide visual health status indicators
 */

/**
 * Returns Tailwind CSS class for HP bar color based on health percentage
 * @param currentHp - Current HP value
 * @param maxHp - Maximum HP value
 * @returns Tailwind background color class
 */
export function getHPBarColor(currentHp: number, maxHp: number): string {
    if (currentHp <= 0) return 'bg-gray-500';

    const percentage = (currentHp / maxHp) * 100;

    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
}

/**
 * Returns text description of HP status for accessibility
 * @param currentHp - Current HP value
 * @param maxHp - Maximum HP value
 * @returns French text description of health status
 */
export function getHPStatusText(currentHp: number, maxHp: number): string {
    if (currentHp <= 0) return 'Mort';

    const percentage = (currentHp / maxHp) * 100;

    if (percentage >= 75) return 'Indemne';
    if (percentage >= 50) return 'Touché';
    if (percentage >= 25) return 'Blessé';
    return 'Critique';
}
