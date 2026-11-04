import { TMDB_IMAGE_BASE } from './constants';

const FALLBACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#191d27"/>
      <stop offset="100%" stop-color="#0b0d12"/>
    </linearGradient>
  </defs>
  <rect width="500" height="750" fill="url(#g)"/>
  <g fill="none" stroke="#3a4152" stroke-width="6" stroke-linecap="round">
    <rect x="150" y="300" width="200" height="140" rx="16"/>
    <path d="M150 340h200M190 300v40M230 300v40M270 300v40M310 300v40"/>
    <path d="M150 395l45-30 55 38 50-26 50 28" />
  </g>
  <text x="250" y="500" font-family="Arial, sans-serif" font-size="20" fill="#5b6376" text-anchor="middle">No poster available</text>
</svg>`;

export const FALLBACK_POSTER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_SVG)}`;

const FALLBACK_PROFILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" fill="#141821"/>
  <circle cx="150" cy="115" r="48" fill="#2a3040"/>
  <path d="M60 270c8-52 43-82 90-82s82 30 90 82" fill="#2a3040"/>
</svg>`;

export const FALLBACK_PROFILE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FALLBACK_PROFILE_SVG)}`;

export function tmdbImage(path, size = 'w500') {
  if (!path) return FALLBACK_POSTER;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function posterUrl(path, size = 'w500') {
  return tmdbImage(path, size);
}

export function backdropUrl(path, size = 'w1280') {
  if (!path) return '';
  return tmdbImage(path, size);
}

export function profileUrl(path, size = 'w300') {
  if (!path) return FALLBACK_PROFILE;
  return tmdbImage(path, size);
}

export function handleImageError(event, fallback = FALLBACK_POSTER) {
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
}
