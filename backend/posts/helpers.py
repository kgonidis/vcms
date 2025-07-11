import io
from typing import Dict
from datetime import datetime, timezone
from .models import Post, Asset, Social
from .post import MediaObject, MediaPost
from .blob import MinioClient
from .twitter import Twitter
from .instagram import Instagram
from .bluesky import Bluesky
from .scheduler import TaskScheduler

MEDIA_POSTERS: Dict[str, MediaPost] = {
    "x": Twitter,
    "instagram": Instagram,
    "bluesky": Bluesky,
}


def upload_media(media_obj: MediaObject, asset: Asset) -> None:
    """
    Uploads a media object to MinioClient.

    Args:
        media_obj (MediaObject): The media object to upload.
        asset (Asset): The asset containing bucket and key information.

    Raises:
        Exception: If an error occurs during the upload process.
    """
    # Upload the media to MinioClient
    media_obj.media.seek(0)  # Reset the file pointer to the beginning
    try:
        MinioClient.instance().put_object(
            asset.bucket,
            asset.key,
            media_obj.media,
        )
    except Exception as e:
        print(f"Error uploading media to MinioClient: {e}")
        raise


def post_immediate(post: Post, media_obj: MediaObject = None) -> None:
    """
    Posts content immediately to the specified social media platforms.

    Args:
        post (Post): The post object containing text and associated assets.
        media_obj (MediaObject, optional): The media object to post. Defaults to None.

    Raises:
        RuntimeError: If an error occurs while retrieving media from MinioClient.
        ValueError: If the social media platform is unsupported.
    """
    # get media from MinioClient if it exists

    if media_obj is None:
        for _media in post.assets.all():
            # deep copy the media object
            media: Asset = _media
            try:
                # get media from MinioClient if it exists
                file = MinioClient.instance().get_object(media.bucket, media.key)
                media_obj = MediaObject(media.file_name, media.mime_type, file)
            except Exception as e:
                raise RuntimeError(
                    f"Error retrieving media {media.key} from MinioClient: {e}"
                )
            break

    def get_media_copy():
        if media_obj is None:
            return None
        media_obj.media.seek(0)  # Reset the file pointer to the beginning
        b = media_obj.media.read()
        return MediaObject(
            name=media_obj.name,
            mime_type=media_obj.mime_type,
            media=io.BytesIO(b),
        )

    for _s in post.socials.all():
        s: Social = _s
        if s.social not in MEDIA_POSTERS:
            raise ValueError(f"Unsupported social media platform: {s.social}")
        media_poster = MEDIA_POSTERS[s.social].instance()
        # deep copy the media object
        try:
            media_poster.post(
                post.text,
                media=get_media_copy(),
            )
        except Exception as e:
            print(f"Error posting to {s.social}: {e}")


def post_safe(post: Post, media_obj: MediaObject = None) -> None:
    """
    Safely posts content to social media platforms, handling exceptions.

    Args:
        post (Post): The post object containing text and associated assets.
        media_obj (MediaObject, optional): The media object to post. Defaults to None.
    """
    print(f"Posting {post.text} to {post.socials.all()}")
    try:
        post_immediate(post, media_obj)
    except Exception as e:
        print(e)


def schedule_post(post: Post, media_obj: MediaObject = None) -> None:
    """
    Schedules a post for future publication or posts it immediately if required.

    Args:
        post (Post): The post object containing text, schedule, and repeat information.
        media_obj (MediaObject, optional): The media object to post. Defaults to None.
    """
    if media_obj is not None:
        # Upload the media to MinioClient
        for _media in post.assets.all():
            media: Asset = _media
            upload_media(media_obj, media)
            break

    if post.immediate:
        post_immediate(post, media_obj)
        return

    # Schedule the post using a task queue or cron job
    TaskScheduler.instance().schedule(
        post.id,
        post.schedule,
        post_safe,
        post,
        repeat=(
            post.repeat
            if post.repeat and post.repeat != "" and post.repeat != "none"
            else None
        ),
    )


def delete_post_artifacts(post: Post) -> None:
    """
    Deletes all artifacts related to a post, including scheduled tasks and media.

    Args:
        post (Post): The post object whose artifacts need to be deleted.
    """
    # Delete the post from the task queue or cron job
    TaskScheduler.instance().cancel(job_id=post.id)

    # Delete the media from MinioClient if it exists
    for _media in post.assets.all():
        media: Asset = _media
        try:
            MinioClient.instance().delete_object(media.bucket, media.key)
        except Exception as e:
            print(f"Error deleting media {media.key} from MinioClient: {e}")


def reschedule_post(post: Post) -> None:
    """
    Reschedules a post based on its schedule and repeat settings.

    Args:
        post (Post): The post object containing schedule and repeat information.
    """
    if post.schedule is None:
        return

    # if now is smaller than the schedule, reschedule the post
    if post.schedule > datetime.now(timezone.utc):
        TaskScheduler.instance().schedule(
            post.id,
            post.schedule,
            post_safe,
            post,
            repeat=(
                post.repeat
                if post.repeat and post.repeat != "" and post.repeat != "none"
                else None
            ),
        )
    elif post.repeat and post.repeat != "" and post.repeat != "none":
        TaskScheduler.instance().schedule_after(post.id, post.repeat, post_safe, post)


def reset_posters() -> None:
    """
    Resets the instances of all media posters.
    """
    for media_poster in MEDIA_POSTERS.values():
        media_poster.reset()
