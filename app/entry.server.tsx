/**
 * Used only at build time: `ssr: false` + `prerender` renders every route to
 * static HTML. There are no crawlers to sniff and no streaming to a live
 * client, so the whole document is awaited before it is written.
 */
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export const streamTimeout = 10_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Promise<Response> {
  let status = responseStatusCode;
  const stream = await renderToReadableStream(<ServerRouter context={routerContext} url={request.url} />, {
    signal: AbortSignal.timeout(streamTimeout),
    onError(error: unknown) {
      status = 500;
      console.error(error);
    },
  });
  await stream.allReady;
  responseHeaders.set("Content-Type", "text/html; charset=utf-8");
  return new Response(stream, { headers: responseHeaders, status });
}
