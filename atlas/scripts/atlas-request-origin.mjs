export function isTrustedAtlasOrigin(request, { adminPort, editorPort }) {
  const origin = request.headers.origin;
  const hostHeader = request.headers.host;
  if (typeof origin !== "string" || typeof hostHeader !== "string") return false;

  let originUrl;
  let requestUrl;
  try {
    originUrl = new URL(origin);
    requestUrl = new URL(`http://${hostHeader}`);
  } catch {
    return false;
  }

  if (originUrl.host.toLowerCase() === requestUrl.host.toLowerCase()) return true;
  if (
    originUrl.hostname.toLowerCase() === requestUrl.hostname.toLowerCase()
    && [adminPort, editorPort].includes(Number(originUrl.port))
  ) {
    return true;
  }

  // Home Assistant Ingress proxies browser requests to the app port. In this
  // case Host is the internal app host, while Origin describes the HA frontend.
  // Accept it only when HA's ingress marker and forwarded public origin agree.
  const ingressPath = request.headers["x-ingress-path"];
  const ingressSource = request.headers["x-hass-source"];
  const forwardedHost = request.headers["x-forwarded-host"];
  const forwardedProto = request.headers["x-forwarded-proto"];
  const remoteAddress = request.socket?.remoteAddress?.replace(/^::ffff:/, "");
  if (
    typeof ingressPath !== "string"
    || !/^\/api\/hassio_ingress\/[^/?#]+\/?$/.test(ingressPath)
    || ingressSource !== "core.ingress"
    || remoteAddress !== "172.30.32.2"
    || typeof forwardedHost !== "string"
    || typeof forwardedProto !== "string"
  ) {
    return false;
  }

  try {
    const forwardedOrigin = new URL(`${forwardedProto}://${forwardedHost}`);
    return forwardedOrigin.origin.toLowerCase() === originUrl.origin.toLowerCase();
  } catch {
    return false;
  }
}
