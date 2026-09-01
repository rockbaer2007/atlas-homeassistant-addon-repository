export type HomeAssistantAddOnRepositoryLinkRequest = Readonly<{
  repositoryUrl: string;
  baseUrl?: string;
}>;

const defaultAddOnRepositoryRedirectUrl = "https://my.home-assistant.io/redirect/supervisor_add_addon_repository/";
const sensitiveRepositoryUrlParameterPattern = /token|secret|password|api[_-]?key|authorization/i;

export function createHomeAssistantAddOnRepositoryLink(
  request: HomeAssistantAddOnRepositoryLinkRequest,
): string {
  const repositoryUrl = sanitizeHomeAssistantRepositoryUrl(request.repositoryUrl);
  if (!repositoryUrl) {
    return "";
  }

  const url = new URL(request.baseUrl ?? defaultAddOnRepositoryRedirectUrl);
  url.searchParams.set("repository_url", repositoryUrl);
  return url.toString();
}

export function sanitizeHomeAssistantRepositoryUrl(value: string): string {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    url.username = "";
    url.password = "";
    for (const key of [...url.searchParams.keys()]) {
      if (sensitiveRepositoryUrlParameterPattern.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}
