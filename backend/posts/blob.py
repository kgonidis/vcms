"""
pip install minio
export MINIO_ENDPOINT="play.min.io:9000"
export MINIO_ACCESS_KEY="YOURACCESSKEY"
export MINIO_SECRET_KEY="YOURSECRET"
export MINIO_SECURE="true"   # "false" for http
"""
from __future__ import annotations

import os, io, threading
from typing import IO, Optional
import logging

from minio import Minio
from minio.error import S3Error

logger = logging.getLogger("posts")

class MinioClient:
    """
    Thread-safe Singleton façade for MinIO.

    Usage
    -----
    m = MinioClient.instance()                           # always the same object
    with open("cat.jpg", "rb") as f:
        m.put_object("photos", "pets/cat.jpg", f)

    buf = m.get_object("photos", "pets/cat.jpg")
    print("downloaded", len(buf.getvalue()), "bytes")
    """

    _lock   = threading.RLock()
    _inst: Optional["MinioClient"] = None

    # ---------------- singleton ctor ---------------- #
    def __init__(self):
        if MinioClient._inst is not None:               # enforce singleton
            raise RuntimeError("Use MinioClient.instance()")

        endpoint   = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        access_key = os.getenv("MINIO_ACCESS_KEY", "minio")
        secret_key = os.getenv("MINIO_SECRET_KEY", "minio123")
        secure     = os.getenv("MINIO_SECURE", "false").lower() == "true"

        self._client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )

    @classmethod
    def instance(cls) -> "MinioClient":
        with cls._lock:
            if cls._inst is None:
                cls._inst = cls()
        return cls._inst

    # ----------------------- API -------------------- #
    def put_object(self, bucket: str, key: str, data: IO[bytes]) -> None:
        """
        Upload the contents of any IOBase (must be opened in *binary* mode).

        If the bucket doesn’t exist, create it first.
        """
        length = _length_of(data)
        try:
            # create bucket if it doesn't exist
            if not self._client.bucket_exists(bucket):
                self._client.make_bucket(bucket)
            self._client.put_object(
                bucket_name=bucket,
                object_name=key,
                data=data,
                length=length,
                part_size=10 * 1024 * 1024,  # 10 MiB multipart
            )
        except S3Error as exc:
            if exc.code == "NoSuchBucket":
                self._client.make_bucket(bucket)
                data.seek(0)
                self.put_object(bucket, key, data)  # retry once
            else:
                raise

    def get_object(self, bucket: str, key: str) -> io.BytesIO:
        """
        Download `bucket/key` and return it as an in-memory BytesIO.
        """
        response = self._client.get_object(bucket, key)
        try:
            buf = io.BytesIO(response.data)
        finally:
            response.close()
            response.release_conn()
        buf.seek(0)
        return buf

    def delete_object(self, bucket: str, key: str) -> None:
        """
        Delete the object at `bucket/key`.
        """
        try:
            self._client.remove_object(bucket, key)
        except S3Error as exc:
            logger.error(f"Error deleting object {key} from bucket {bucket}: {exc}")


# ───────────────── helpers ───────────────── #
def _length_of(stream: IO[bytes]) -> int:
    """
    Ensure we know the stream length (MinIO needs it).

    • If the object is seek-able → keep position, seek to end.
    • Otherwise → read entire object into memory and return its size.
    """
    pos = None
    try:
        pos = stream.tell()
        stream.seek(0, io.SEEK_END)
        size = stream.tell()
        stream.seek(pos)
        return size
    except (AttributeError, OSError):
        pass  # not seek-able

    # fallback – load into BytesIO
    data = stream.read()
    size = len(data)
    stream.close()
    stream = io.BytesIO(data)  # replace original
    return size


# ─────────────── demo ─────────────── #
if __name__ == "__main__":
    c = MinioClient.instance()

    # upload from memory
    bio = io.BytesIO(b"hello minio")
    c.put_object("testbucket", "hello.txt", bio)

    # download again
    out = c.get_object("testbucket", "hello.txt")
    print(out.getvalue())        # b'hello minio'
