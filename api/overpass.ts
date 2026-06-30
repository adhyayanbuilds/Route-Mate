import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

let body: string;

if (typeof req.body === 'string') {
  body = req.body;
} else if (req.body?.data) {
  body = 'data=' + encodeURIComponent(req.body.data);
} else {
  body = new URLSearchParams(req.body).toString();
}

  try {
    const upstream = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(25000),
    });

    if (!upstream.ok) {
  const text = await upstream.text();

  return res.status(upstream.status).json({
    status: upstream.status,
    body: text,
  });
}

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Overpass API' });
  }
}
