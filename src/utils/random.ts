export function getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min + 1) + min;
}

export function getIntRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomElement<T>(array: T[]): T | undefined {
    if (array.length === 0) {
        return undefined; // Возвращаем undefined, если массив пустой
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
