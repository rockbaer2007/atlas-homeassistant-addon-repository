"""ATLAS frontend constants and credential-free runtime URL validation."""
import re
from urllib.parse import urlsplit, urlunsplit

DOMAIN = "atlas_frontend"
PANEL_PATH = "atlas-runtime"
CONF_RUNTIME_URL = "runtime_url"
VERSION = "0.1.299"


def normalize_runtime_url(value: str) -> str:
    """Accept an explicit browser URL without credentials, queries or fragments."""
    if not isinstance(value, str) or re.search(r"[\s\\\x00-\x1f\x7f]", value):
        raise ValueError("invalid_runtime_url")
    parsed = urlsplit(value)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("invalid_runtime_url")
    if parsed.username is not None or parsed.password is not None or parsed.query or parsed.fragment:
        raise ValueError("invalid_runtime_url")
    if parsed.port is not None and not 1 <= parsed.port <= 65535:
        raise ValueError("invalid_runtime_url")
    if not re.fullmatch(r"[A-Za-z0-9.:_-]+", parsed.hostname):
        raise ValueError("invalid_runtime_url")
    if not re.fullmatch(r"[/A-Za-z0-9._~-]*", parsed.path) or any(part in (".", "..") for part in parsed.path.split("/")):
        raise ValueError("invalid_runtime_url")
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path.rstrip("/") + "/", "", ""))
