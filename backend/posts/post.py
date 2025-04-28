from dataclasses import dataclass
from io import IOBase


@dataclass
class MediaObject:
    name: str
    mime_type: str
    media: IOBase


class MediaPost:
    _inst = None

    @classmethod
    def instance(cls):
        # This method should return an instance of the class
        # For example, it could be a singleton or a new instance
        return cls()

    def post(self, text: str, media: MediaObject = None):
        print(f"Posting {text} to {self.__class__.__name__}")
        

    @classmethod
    def reset(cls):
        # Reset the instance to None
        cls._inst = None
