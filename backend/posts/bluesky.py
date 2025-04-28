# bluesky.py  –  simple façade around atproto
#
# pip install atproto           # official SDK
#
# Environment variables the .instance() helper looks for:
#   BSKY_HANDLE       = "alice.bsky.social"
#   BSKY_APP_PASSWORD = "xxxx-xxxx-xxxx-xxxx"
#
# If you prefer, pass credentials explicitly via BlueskyCredentials.

from dataclasses import dataclass
from typing import Optional

from atproto import Client

from .models import IntegrationSecrets

if __name__ == "__main__":
    from post import MediaObject
else:
    from .post import MediaObject


# ──────────────────────────────────────────────────────────────────────────────
#  Data classes
# ──────────────────────────────────────────────────────────────────────────────
@dataclass
class BlueskyCredentials:
    handle: str  # @handle or DID
    app_password: str


# ──────────────────────────────────────────────────────────────────────────────
#  Singleton wrapper
# ──────────────────────────────────────────────────────────────────────────────
class Bluesky:
    """
    Minimal wrapper around atproto.Client that can:
        • upload a blob (image / video) and
        • create a feed post with or without that media.

    Usage
    -----
    bsky = Bluesky.instance()               # env-based singleton
    bsky.post("Hello world!")

    # with an image
    from pathlib import Path, PurePath
    with Path("cat.png").open("rb") as f:
        media = MediaObject("cat.png", f, "image/png")
        bsky.post("Here's my cat", media)
    """

    _inst: Optional["Bluesky"] = None

    def __init__(self, credentials: BlueskyCredentials):
        self.client = Client()
        self.client.login(credentials.handle, credentials.app_password)

    # -------- convenience singleton -----------------
    @classmethod
    def instance(cls) -> "Bluesky":
        if cls._inst is not None:
            return cls._inst

        try:
            secrets = IntegrationSecrets.objects.latest("created_at")
        except IntegrationSecrets.DoesNotExist:
            return super().instance()

        creds = BlueskyCredentials(
            handle=secrets.bsky_handle,
            app_password=secrets.bsky_app_password,
        )
        cls._inst = cls(creds)
        return cls._inst

    @classmethod
    def reset(cls):
        """
        Reset the singleton instance.  Use this if you change credentials.
        """
        cls._inst = None

    # -------- public API ----------------------------
    def post(self, text: str, media: MediaObject | None = None, alt: str = ""):
        """
        Publish `text` to your feed.  If `media` supplied, attach it.

        Parameters
        ----------
        text   : str            – post text
        media  : MediaObject    – optional image or video
        alt    : str            – alt-text for accessibility (defaults to media.name)
        """

        if media is not None:
            media.media.seek(0)  # rewind the stream
            b = media.media.read()
            if "image/" in media.mime_type:
                self.client.send_image(text, b, image_alt=alt)
            elif "video/" in media.mime_type:
                self.client.send_video(text, b, video_alt=alt)
        else:
            self.client.send_post(text)


# ──────────────────────────────────────────────────────────────────────────────
#  quick smoke-test
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    bsky = Bluesky.instance()
    bsky.post("Hello from a script!")
