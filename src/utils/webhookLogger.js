const https = require('https');

const WEBHOOK_URL = process.env.WEBHOOK_LOGS || 'https://discord.com/api/webhooks/1531400749450268913/FJEN3gP1k-qWrfzbgzx5A1q_AzU8qXhuCkGRjzTBD1c36kO2Hq1732e3jLsgd2IeWyJI';

function sendLogWebhook({ content = null, embeds = [], username = 'KodaBot Logs' }) {
    return new Promise((resolve) => {
        try {
            const payload = JSON.stringify({ content, embeds, username });
            const url = new URL(WEBHOOK_URL);
            const req = https.request({
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', (err) => {
                console.error('[WEBHOOK] Erro ao enviar log:', err.message);
                resolve();
            });
            req.write(payload);
            req.end();
        } catch (error) {
            console.error('[WEBHOOK] Erro ao enviar log:', error);
            resolve();
        }
    });
}

module.exports = { sendLogWebhook };
