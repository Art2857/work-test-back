export function getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min + 1) + min;
}

export function getIntRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
