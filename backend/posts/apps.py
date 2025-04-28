from django.apps import AppConfig
import logging
from django.db.backends.signals import connection_created

logger = logging.getLogger(__name__)

def setup_scheduler(**kwargs):
    from .models import Post
    from .helpers import reschedule_post
    logger.info("Setting up scheduler for posts")

    posts = Post.objects.filter(immediate=False).values()
    for _post in posts:
        try:
            post = Post(**_post)
            reschedule_post(post)
        except Exception as e:
            logger.warning(f"Error rescheduling post {post.id}: {e}")


class PostsConfig(AppConfig):
    name = "posts"
    def ready(self):
        loggers = [logging.getLogger(name) for name in logging.root.manager.loggerDict]
        for logger in loggers:
            logger.setLevel(logging.INFO)
        setup_scheduler()
        return super().ready()
