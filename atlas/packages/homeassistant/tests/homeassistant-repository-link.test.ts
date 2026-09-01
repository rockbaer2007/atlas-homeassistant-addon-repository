import { describe, expect, it } from "vitest";
import {
  createHomeAssistantAddOnRepositoryLink,
  sanitizeHomeAssistantRepositoryUrl,
} from "../src";

describe("Home Assistant repository links", () => {
  it("creates the My Home Assistant add-on repository redirect with a prefilled repository URL", () => {
    const link = createHomeAssistantAddOnRepositoryLink({
      repositoryUrl: "https://github.com/rockbaer2007/atlas",
    });
    const url = new URL(link);

    expect(url.origin).toBe("https://my.home-assistant.io");
    expect(url.pathname).toBe("/redirect/supervisor_add_addon_repository/");
    expect(url.searchParams.get("repository_url")).toBe("https://github.com/rockbaer2007/atlas");
  });

  it("removes credentials, fragments and sensitive query parameters from repository URLs", () => {
    const link = createHomeAssistantAddOnRepositoryLink({
      repositoryUrl: "https://user:pass@example.test/addons?token=abc&view=main#secret",
      baseUrl: "https://my.home-assistant.io/redirect/supervisor_add_addon_repository/",
    });
    const url = new URL(link);

    expect(url.searchParams.get("repository_url")).toBe("https://example.test/addons?view=main");
    expect(link).not.toContain("abc");
    expect(link).not.toContain("pass");
    expect(link).not.toContain("secret");
  });

  it("rejects non-web repository URLs", () => {
    expect(sanitizeHomeAssistantRepositoryUrl("file:///data/addons")).toBe("");
    expect(createHomeAssistantAddOnRepositoryLink({ repositoryUrl: "not a url" })).toBe("");
  });
});
