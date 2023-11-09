export const sleep = (duration: number = 120000) => {
    return new Promise<boolean>((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, duration);
    });
};
