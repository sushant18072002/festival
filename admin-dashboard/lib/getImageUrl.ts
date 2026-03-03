/**
 * getImageUrl — Returns the correct URL to display an image in the admin dashboard.
 *
 * Strategy:
 *   - Always route through /api/image-proxy?key={s3_key}
 *   - The proxy serves local files first (fast), then falls back to a pre-signed S3 URL
 *   - This works for both public and private S3 buckets
 *   - No CDN needed in the admin — CDN is only for the Flutter app production build
 */
export function getImageUrl(s3Key?: string): string {
    if (!s3Key) return '';
    // Route through our server-side proxy which handles local + private S3 images
    return `/api/image-proxy?key=${encodeURIComponent(s3Key)}`;
}

/**
 * getS3PublicUrl — Returns the direct S3 public URL (for sharing / copying live links).
 * Only works if the bucket has public read access.
 */
export function getS3PublicUrl(s3Key?: string): string {
    if (!s3Key) return '';
    const bucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME || 'turntaptravel-s3';
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}
