from .views import PostView, IntegrationSecretsView
from django.urls import path

urlpatterns = [
    path('post', PostView.as_view(), name='post'),
    path('post/<int:id>', PostView.as_view(), name='post-detail'),
    path('secrets', IntegrationSecretsView.as_view(), name='secrets'),
]