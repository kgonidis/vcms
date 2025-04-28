import io
import tweepy
from dataclasses import dataclass
from os import environ
import logging

from .post import MediaPost, MediaObject
from .models import IntegrationSecrets

logger = logging.getLogger("posts")


@dataclass
class TwitterCredentials:
    bearer_token: str
    api_key: str
    api_secret_key: str
    access_token: str
    access_token_secret: str


class Twitter(MediaPost):
    MEDIA_UPLOAD_URL = "https://api.x.com/2/media/upload"
    TWEET_URL = "https://api.x.com/2/tweets"

    _inst: "Twitter" = None

    def __init__(self, credentials: TwitterCredentials = None):
        if credentials is not None:
            auth = tweepy.OAuthHandler(
                consumer_key=credentials.api_key,
                consumer_secret=credentials.api_secret_key,
            )
            auth.set_access_token(
                key=credentials.access_token,
                secret=credentials.access_token_secret,
            )
            self.api = tweepy.API(auth)
            self.client = tweepy.Client(
                bearer_token=credentials.bearer_token,
                consumer_key=credentials.api_key,
                consumer_secret=credentials.api_secret_key,
                access_token=credentials.access_token,
                access_token_secret=credentials.access_token_secret,
            )
        else:
            self.api = None
            self.client = None

    @classmethod
    def instance(cls):
        if cls._inst is not None:
            return cls._inst

        # get credentials from IntegrationSecrets most recent entry
        try:
            secrets = IntegrationSecrets.objects.latest("created_at")
        except IntegrationSecrets.DoesNotExist:
            return super().instance()

        credentials = TwitterCredentials(
            bearer_token=secrets.x_bearer_token,
            api_key=secrets.x_consumer_key,
            api_secret_key=secrets.x_consumer_secret,
            access_token=secrets.x_access_token,
            access_token_secret=secrets.x_access_secret,
        )

        cls._inst = cls(credentials)
        return cls._inst

    @classmethod
    def reset(cls):
        cls._inst = None

    def upload_media(
        self, filename: str, media: io.IOBase, mime_type: str, category: str = None
    ) -> str:
        if self.api is None:
            raise ValueError("Twitter API client is not initialized.")
        category = category or (
            "tweet_image" if mime_type.startswith("image/") else "tweet_video"
        )
        resp = self.api.media_upload(filename, file=media, media_category=category)
        return resp.media_id_string

    def post(self, text: str, media: MediaObject = None):
        if self.client is None:
            self._inst = None
            raise Exception(
                "Twitter client is not initialized. Please provide credentials."
            )
        else:
            if media is not None:
                media_id = self.upload_media(media.name, media.media, media.mime_type)
                # post with media
                self.client.create_tweet(
                    text=text,
                    media_ids=[media_id],
                )
            else:
                self.client.create_tweet(
                    text=text,
                )
