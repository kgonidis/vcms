from rest_framework import serializers
from .models import Post, Social, Asset, IntegrationSecrets

class SocialSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Social
        fields = ("social",)

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Asset
        fields = ("file_name", "bucket", "key")

class PostSerializer(serializers.ModelSerializer):
    socials = SocialSerializer(many=True)
    assets  = AssetSerializer(many=True, required=False)

    class Meta:
        model  = Post
        fields = ("id", "text", "schedule", "repeat",
                  "immediate", "time", "socials", "assets")

    # ---------- CREATE ----------
    def create(self, validated):
        socials_data = validated.pop("socials")
        assets_data  = validated.pop("assets", [])
        post = Post.objects.create(**validated)

        # socials
        Social.objects.bulk_create(
            [Social(post=post, social=s["social"]) for s in socials_data]
        )

        # assets – files already saved via FileField
        for a in assets_data:
            Asset.objects.create(
                post=post,
                file_name=a["file_name"],
                bucket=a["bucket"],
                key=a.get("key", ""),
            )
        return post

class IntegrationSecretsSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationSecrets
        fields = "__all__"