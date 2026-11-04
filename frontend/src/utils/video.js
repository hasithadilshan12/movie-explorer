export function findTrailer(videos = []) {
  const youtube = videos.filter((video) => video.site === 'YouTube');
  return (
    youtube.find((video) => video.type === 'Trailer' && video.official) ||
    youtube.find((video) => video.type === 'Trailer') ||
    youtube.find((video) => video.type === 'Teaser') ||
    youtube[0] ||
    null
  );
}
