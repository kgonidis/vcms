from django.db import models

class Post(models.Model):
    text        = models.TextField()
    schedule = models.DateTimeField(null=True, blank=True)  # when to run job
    repeat      = models.CharField(max_length=10, blank=True)  # repeat job
    immediate   = models.BooleanField(default=False)
    time = models.DateTimeField(auto_now_add=True)      # when record created

    def __str__(self) -> str:
        return f"{self.id}: {self.text[:40]}"

class Social(models.Model):
    post   = models.ForeignKey(Post, related_name="socials", on_delete=models.CASCADE)
    social = models.CharField(max_length=30)

class Asset(models.Model):
    post       = models.ForeignKey(Post, related_name="assets", on_delete=models.CASCADE)
    file_name  = models.CharField(max_length=255)
    bucket     = models.CharField(default="media", max_length=255)  # S3 bucket name
    key        = models.CharField(max_length=255, blank=True)   # S3 key
    mime_type  = models.CharField(default="image/jpeg", max_length=255, blank=True)  # mime type
# app/models.py
from django.db import models


class IntegrationSecrets(models.Model):
    # ---------- X / Twitter ----------
    x_consumer_key    = models.CharField(max_length=128)
    x_consumer_secret = models.CharField(max_length=256)
    x_access_token    = models.CharField(max_length=128)
    x_access_secret   = models.CharField(max_length=256)
    x_bearer_token    = models.TextField()

    # ---------- Instagram ------------
    instagram_username = models.CharField(max_length=150)
    instagram_password = models.CharField(max_length=256)

    # ---------- Bluesky --------------
    bsky_handle        = models.CharField(max_length=150)
    bsky_app_password  = models.CharField(max_length=256)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Secrets #{self.pk} (created {self.created_at:%Y-%m-%d})"
