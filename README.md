# VCMS: Social Media Scheduler

VCMS (Video Content Management System) is a platform for scheduling and automating social media posts across multiple platforms, including Instagram, X (formerly Twitter), and Bluesky. It consists of a **Django backend** and a **Next.js React frontend**.

---

## Features

- Schedule posts to multiple social media platforms.
- Upload and manage media assets (images/videos).
- Support for recurring posts (daily, weekly, monthly).
- Admin interface for managing API credentials.
- CI/CD pipeline for automated testing, building, and deployment.

---

## Prerequisites

- **Docker** and **Docker Compose** installed.
- Optional: Python 3.12+ and Node.js 22+ for local development.

---

## Quick Start (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/vcms.git
   cd vcms
   ```

2. Run the `quick_start.sh` script to build and start the services:
   ```bash
   ./quick_start.sh
   ```

3. Access the application:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)

4. Log in to the MinIO console (optional for media management):
   - URL: [http://localhost:9001](http://localhost:9001)
   - Username: `minio`
   - Password: `minio123`

5. Inspect the PostgreSQL database:
   ```bash
   docker exec -it postgres psql -U postgres -d postgres
   ```
   Use SQL commands to query the database, e.g., `\dt` to list tables.

---

## Adding API Credentials

To connect the platform to social media accounts, you need to add API credentials via the **Admin Page**:

1. Navigate to the Admin page:
   - [http://localhost:3000/admin](http://localhost:3000/admin)

2. Fill in the required fields for each platform:
   - **X (Twitter)**: Consumer Key, Consumer Secret, Access Token, Access Secret, Bearer Token.
   - **Instagram**: Username and Password.
   - **Bluesky**: Handle and App Password.

3. Click **Save** to store the credentials.

### Alternative: Using `curl`

You can also upload API credentials directly to the backend API using the following `curl` command:

```bash
curl -X POST http://localhost:8000/api/secrets \
-H "Content-Type: application/json" \
-d '{
  "x_consumer_key": "your-consumer-key",
  "x_consumer_secret": "your-consumer-secret",
  "x_access_token": "your-access-token",
  "x_access_secret": "your-access-secret",
  "x_bearer_token": "your-bearer-token",
  "instagram_username": "your-instagram-username",
  "instagram_password": "your-instagram-password",
  "bsky_handle": "your-bluesky-handle",
  "bsky_app_password": "your-bluesky-app-password"
}'
```

Replace the placeholder values with your actual credentials. If successful, the API will respond with a confirmation message.

---

## Scheduling Posts

1. On the homepage, click **Schedule a Post**.
2. Fill in the post details:
   - Text content.
   - Media files (optional).
   - Social platforms to post to.
   - Timing (immediate or scheduled).
   - Recurrence (daily, weekly, monthly).
3. Submit the form to schedule the post.

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow for CI/CD. The pipeline performs the following steps:

1. **Testing**:
   - Backend: Runs Python tests using `pytest`.
   - Frontend: Runs linting and builds the Next.js app.

2. **Building Docker Images**:
   - Builds and pushes Docker images for the backend and frontend to GitHub Container Registry (GHCR).

3. **Deployment**:
   - Deploys the application to a production server using Docker Compose.

### Triggering the Workflow

The workflow is triggered on every push to the `main` branch. Ensure the following secrets are configured in your GitHub repository:

- `GHCR_PAT`: GitHub Container Registry Personal Access Token.
- `PROD_SSH_KEY`: SSH private key for the production server.
- `PROD_HOST`: Production server hostname.
- `PROD_SSH_USER`: SSH username for the production server.

---

## Local Development

### Backend

1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. **How `.env` Variables Link to the Backend**:
   The frontend uses the `NEXT_PUBLIC_API_URL` environment variable to communicate with the backend API. This variable is defined in the `.env` file and points to the backend service URL (e.g., `http://localhost:8000` for local development). Ensure the value matches the backend's running address to enable proper API communication.

---

## Environment Variables

The following environment variables are used in the project:

### Backend

- `POSTGRES_DB`: PostgreSQL database name.
- `POSTGRES_USER`: PostgreSQL username.
- `POSTGRES_PASSWORD`: PostgreSQL password.
- `POSTGRES_HOST`: PostgreSQL host.
- `POSTGRES_PORT`: PostgreSQL port.
- `MINIO_ENDPOINT`: MinIO endpoint.
- `MINIO_ACCESS_KEY`: MinIO access key.
- `MINIO_SECRET_KEY`: MinIO secret key.
- `MINIO_SECURE`: Use HTTPS (`true` or `false`).

### Frontend

- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `http://localhost:8000`).

---

## File Structure

- **`backend/`**: Django backend for API and scheduling logic.
- **`src/`**: Next.js frontend for user interface.
- **`docker-compose.yaml`**: Docker Compose configuration for local development.
- **`quick_start.sh`**: Script to set up and run the project in Docker.

---

## License

This project is licensed under the [MIT License](LICENSE).
