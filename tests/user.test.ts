import { fetch } from 'undici';

test('test user balance update', async () => {
    let successed = 0;
    for (let i = 0; i < 10000; i++) {
        const response = await fetch('http://localhost:3000/user/1/balance', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: -2,
            }),
        });

        if (response && response.status === 200) {
            successed++;
        }
    }

    expect(successed).toBe(5000); // Расчёт на то что баланс будет 10000
});
