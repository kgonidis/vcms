from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from uuid import uuid4
from typing import Dict
from logging import getLogger

from .models import Post, IntegrationSecrets
from .serializers import PostSerializer, IntegrationSecretsSerializer
from .post import MediaObject, MediaPost
from .twitter import Twitter
from .instagram import Instagram
from .bluesky import Bluesky
from .helpers import schedule_post, delete_post_artifacts, reset_posters

logger = getLogger("posts")

MEDIA_POSTERS: Dict[str, MediaPost] = {
    "x": Twitter,
    "instagram": Instagram,
    "bluesky": Bluesky,
}


class PostView(APIView):
    def get(self, request: Request) -> Response:
        posts = Post.objects.all()
        serialized_posts = PostSerializer(posts, many=True).data
        return Response(serialized_posts, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        # Here you would typically handle the creation of a new post
        # For demonstration, we will just return a success message
        req_dict = {k: v for k, v in request.data.items() if "[]" not in k}
        arrs = {k.replace("[]", ""): v for k, v in request.POST.lists() if "[]" in k}
        req_dict.update(arrs)

        media_obj = None
        if "socials" in req_dict:
            req_dict["socials"] = [{"social": s} for s in req_dict["socials"]]
        if "immediate" in req_dict:
            req_dict["immediate"] = True if req_dict["immediate"] == "true" else False
        if "media" in req_dict:
            file_name = req_dict["media"].name
            mime_type = req_dict["media"].content_type
            media_obj = MediaObject(
                name=file_name,
                mime_type=mime_type,
                media=req_dict["media"].file,
            )
            req_dict["assets"] = [
                {
                    "file_name": file_name,
                    "key": str(uuid4())[:8] + "-" + req_dict["media"].name,
                    "bucket": "media",
                    "mime_type": mime_type,
                }
            ]
            del req_dict["media"]

        serial = PostSerializer(data=req_dict)
        post = None
        if not serial.is_valid():
            logger.error(f"Post serializer error: {serial.errors}")
            return Response(serial.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            post = serial.save()

        try:
            schedule_post(post, media_obj=media_obj)
        except Exception as e:
            logger.error(f"Error scheduling post: {e}")
            return Response(
                {"error": "Error scheduling post."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"message": f"Post {post.id} created successfully!"}, status=status.HTTP_200_OK
        )

    def delete(self, request: Request, id: int) -> Response:
        try:
            post = Post.objects.get(id=id)
            delete_post_artifacts(post)
            post.delete()
            return Response(
                {"message": f"Post {id} deleted successfully!"}, status=status.HTTP_200_OK
            )
        except Post.DoesNotExist:
            return Response(
                {"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting post: {e}")
            return Response(
                {"error": f"Error deleting post. {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class IntegrationSecretsView(APIView):
    def get(self, request: Request) -> Response:
        latest = IntegrationSecrets.objects.order_by("created_at").first()
        if not latest:
            return Response({"message": "No secrets found."}, status=status.HTTP_404_NOT_FOUND)
        serialized = IntegrationSecretsSerializer(latest).data
        return Response(serialized, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        serializer = IntegrationSecretsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        created = serializer.save()
        reset_posters()
        return Response({"message": "New secrets created.", "id": created.pk}, status=status.HTTP_201_CREATED)

    def delete(self, request: Request) -> Response:
        secrets_id = request.query_params.get("id")
        if secrets_id:
            try:
                IntegrationSecrets.objects.get(pk=secrets_id).delete()
                return Response({"message": f"Secrets {secrets_id} deleted."}, status=status.HTTP_200_OK)
            except IntegrationSecrets.DoesNotExist:
                return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Error deleting secrets: {e}")
                return Response({"error": "Error deleting secrets."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try: 
            IntegrationSecrets.objects.all().delete()
        except Exception as e:
            logger.error(f"Error deleting all secrets: {e}")
            return Response({"error": "Error deleting all secrets."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"message": "All secrets deleted."}, status=status.HTTP_200_OK)