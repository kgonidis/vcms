import io
import os
from instagrapi import Client
from dataclasses import dataclass
from os import environ
from tempfile import NamedTemporaryFile
from logging import getLogger

from .post import MediaPost, MediaObject
from .models import IntegrationSecrets

logger = getLogger(__name__)

@dataclass
class InstagramCredentials:
    username: str
    password: str
    
class Instagram(MediaPost):
    _inst: "Instagram" = None

    def __init__(self, credentials: InstagramCredentials = None):
        if credentials is not None:
            self.client = Client()
            try:
                self.client.login(username=credentials.username, password=credentials.password)
            except Exception as e:
                logger.error(f"Failed to login to Instagram: {e}")
                self.client = None
        else:
            self.client = None
    
    @classmethod
    def instance(cls):
        if cls._inst is not None:
            return cls._inst

        try:
            secrets = IntegrationSecrets.objects.latest("created_at")
        except IntegrationSecrets.DoesNotExist:
            return super().instance()

        credentials = InstagramCredentials(
            username=secrets.instagram_username,
            password=secrets.instagram_password,
        )

        cls._inst = cls(credentials)
        return cls._inst

    @classmethod
    def reset(cls):
        cls._inst = None

    def post(self, text: str, media: MediaObject = None):
        if self.client is None:
            self._inst = None
            raise Exception("Instagram client is not initialized. Please provide credentials.")
        if media is None:
            raise Exception("No media provided for posting.")

        with open(media.name, 'wb') as media_file:
            media.media.seek(0)  # rewind the stream
            media_file.write(media.media.read())

        if media.mime_type.startswith('video/'):
            self.client.video_upload(media.name, caption=text)
        else:
            self.client.photo_upload(media.name, caption=text)

        # Clean up the temporary file
        os.remove(media.name)
