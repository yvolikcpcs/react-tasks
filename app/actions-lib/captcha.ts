export async function verifyCaptcha(token: string) {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) throw new Error('Captcha secret key is missing in env');

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: `secret=${secretKey}&response=${token}`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    const data = await res.json();
    console.log('Captcha verification response:', data);
    if (!data.success) throw new Error('Captcha verification failed');
}