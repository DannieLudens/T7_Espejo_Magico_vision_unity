/**
 * api/cloudinary-sign.js — Vercel Function that signs Cloudinary uploads for the WebGL photobooth.
 *
 * The API secret never reaches the browser: it lives in the Vercel environment variables
 * CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET. The signature only covers fixed
 * parameters (folder, JPEG only, size limit), so a signature cannot be reused to upload elsewhere or
 * other kinds of files. Requests must come from this site (Origin check) and are rate limited per IP.
 * Optional: ALLOWED_ORIGINS (comma separated) adds extra origins, e.g. a portfolio that embeds the kiosk.
 */
'use strict';

const crypto = require('crypto');

const FOLDER = 'espejo-magico';                     // same folder as the web kiosk
const ALLOWED_FORMATS = 'jpg';                      // the photobooth only sends JPEG
const TRANSFORMATION = 'c_limit,w_1920,h_1920';     // incoming transformation: caps what gets stored
const WINDOW_MS = 60 * 1000;                        // rate limit window
const MAX_PER_WINDOW = 8;                           // signatures per IP per minute (a photo needs one)
const hits = new Map();                             // ip -> recent request times (per function instance)

// True when the request comes from this deployment, localhost or an origin listed in ALLOWED_ORIGINS.
function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return false;                                          // browsers always send it on POST
  let host;
  try { host = new URL(origin).host; } catch { return false; }
  if (host === req.headers.host) return true;                         // same site as this function
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return true;    // local tests (vercel dev)
  const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return extra.includes(origin);
}

// Sliding-window counter per client IP.
function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method' }); }
  if (!originAllowed(req)) return res.status(403).json({ error: 'origin' });
  if (rateLimited(req)) return res.status(429).json({ error: 'rate' });

  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloudName || !apiKey || !secret) return res.status(503).json({ error: 'config' }); // never say which one

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signature: params sorted by name, joined as key=value&..., followed by the API secret.
  const toSign = `allowed_formats=${ALLOWED_FORMATS}&folder=${FOLDER}&timestamp=${timestamp}&transformation=${TRANSFORMATION}`;
  const signature = crypto.createHash('sha1').update(toSign + secret).digest('hex');

  return res.status(200).json({
    cloudName, apiKey, timestamp, signature,
    folder: FOLDER, allowedFormats: ALLOWED_FORMATS, transformation: TRANSFORMATION,
  });
};
