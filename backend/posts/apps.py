from django.apps import AppConfig
from .models import Post
import logging

from .helpers import reschedule_post

logger = logging.getLogger(__name__)

class PostsConfig(AppConfig):
    def ready(self):
        posts = Post.objects.filter(immediate=False)
        for post in posts:
            try:
                reschedule_post(post)
            except Exception as e:
                logger.warning(f"Error rescheduling post {post.id}: {e}")

        return super().ready()