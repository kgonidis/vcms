from dataclasses import dataclass
from io import IOBase
from logging import getLogger

logger = getLogger("posts")

@dataclass
class MediaObject:
    name: str
    mime_type: str
    media: IOBase


class MediaPost:
    _inst = None

    @classmethod
    def instance(cls):
        """Get the singleton instance of the MediaPost class."""
        return cls()

    def post(self, text: str, media: MediaObject = None):
        """
        Post a message to the social media platform.
        Args:
            text (str): The text to post.
            media (MediaObject, optional): The media object to post. Defaults to None.
        """
        if media:
            media_str = f" with media {media.name} ({media.mime_type})"
        logger.debug(f"Posting {text} to {self.__class__.__name__}{media_str}")

    @classmethod
    def reset(cls):
        """Reset the singleton instance of the MediaPost class."""
        # Reset the instance to None
        cls._inst = None
