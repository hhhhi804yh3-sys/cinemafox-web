/**
 * Cinema Fox - High-Speed Unlimited Video Streaming Worker
 * Deploy to Cloudflare Workers (Free tier: 100,000 requests/day, UNLIMITED bandwidth)
 * 
 * Features:
 * 1. Bypasses hotlink & Referer protection by injecting official MovieBox Referer.
 * 2. Full HTTP Range (206 Partial Content) support for instant seeking and scrubbing.
 * 3. Zero-buffer direct streaming through Cloudflare's global edge network.
 * 4. Open CORS headers for seamless HTML5 video player integration.
 */

export default {
  async fetch(request) {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Content-Type, Accept, Origin, User-Agent",
          "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges, Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl || !targetUrl.startsWith("http")) {
      return new Response(JSON.stringify({ error: "Missing or invalid url parameter" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    try {
      const upstreamHeaders = new Headers();
      upstreamHeaders.set("Referer", "https://movieboxph.org/");
      upstreamHeaders.set(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      );
      upstreamHeaders.set("Accept", "*/*");

      // Forward browser Range header for video seeking & chunking
      const range = request.headers.get("Range");
      if (range) {
        upstreamHeaders.set("Range", range);
      }

      const upstreamResponse = await fetch(targetUrl, {
        method: request.method === "HEAD" ? "HEAD" : "GET",
        headers: upstreamHeaders
      });

      const responseHeaders = new Headers(upstreamResponse.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges, Content-Type");
      responseHeaders.set("Accept-Ranges", "bytes");

      // Ensure proper media content type
      if (!responseHeaders.has("Content-Type")) {
        responseHeaders.set("Content-Type", "video/mp4");
      }

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Stream proxy error", message: err.message }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
