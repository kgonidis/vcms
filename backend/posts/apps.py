from django.apps import AppConfig
import logging
from django.db.backends.signals import connection_created

logger = logging.getLogger("posts")

def setup_scheduler(**kwargs):
    """
    Sets up the scheduler for rescheduling posts that are not marked as immediate.

    This function retrieves all posts that are not immediate and attempts to reschedule them
    using the `reschedule_post` helper function. If an error occurs during rescheduling, 
    it logs a warning with the post ID and the error message.

    Args:
        **kwargs: Arbitrary keyword arguments, typically passed by Django signals.
    """
    from .models import Post
    from .helpers import reschedule_post

    try:
        posts = Post.objects.filter(immediate=False).values()
        for _post in posts:
            try:
                post = Post(**_post)
                reschedule_post(post)
            except Exception as e:
                logger.warning(f"Error rescheduling post {post.id}: {e}")
    except Exception as e:
        logger.warning(f"Error fetching posts for rescheduling: {e}")


class PostsConfig(AppConfig):
    """
    Django AppConfig for the 'posts' application.

    This class is responsible for application-specific configuration and initialization.
    """
    name = "posts"

    def ready(self):
        """
        Called when the application is ready.

        This method sets up the scheduler for rescheduling posts and then calls the parent
        class's `ready` method.
        """
        setup_scheduler()
        return super().ready()
