"""
AgroAI — Async Redis client connection setup and cache utilities.
Provides graceful fallbacks to in-memory local dict if Redis is offline or not installed.
"""
import time
import logging
from typing import Dict, Tuple, Optional
from app.core.config import settings

logger = logging.getLogger("agroai_redis")
logger.setLevel(logging.INFO)

# In-memory local dictionary fallback cache with TTL
_in_memory_cache: Dict[str, Tuple[str, float]] = {}

def _in_memory_get(key: str) -> Optional[str]:
    if key in _in_memory_cache:
        val, expires_at = _in_memory_cache[key]
        if time.time() < expires_at:
            return val
        else:
            del _in_memory_cache[key]
    return None

def _in_memory_set(key: str, value: str, expire: int = 300) -> None:
    expires_at = time.time() + expire
    _in_memory_cache[key] = (value, expires_at)

def _in_memory_delete(key: str) -> None:
    if key in _in_memory_cache:
        del _in_memory_cache[key]


# Global state
redis_client = None
redis_available = False


async def init_redis() -> None:
    """Initializes and tests connection to the Redis server."""
    global redis_client, redis_available
    if not settings.REDIS_URL:
        logger.warning("REDIS_URL is not set. Falling back to local in-memory cache.")
        redis_available = False
        return

    try:
        import redis.asyncio as aioredis
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_timeout=2.0,
            socket_connect_timeout=2.0,
        )
        # Test connection with a ping
        await redis_client.ping()
        redis_available = True
        logger.info("Connected to Redis server successfully. Query caching enabled.")
    except Exception as e:
        logger.warning(f"Could not connect to Redis server ({e}). Falling back to local in-memory cache.")
        redis_available = False
        redis_client = None


async def cache_get(key: str) -> Optional[str]:
    """Retrieves value from Redis or local in-memory cache."""
    if redis_available and redis_client:
        try:
            return await redis_client.get(key)
        except Exception as e:
            logger.error(f"Redis get error: {e}. Accessing in-memory cache.")
    return _in_memory_get(key)


async def cache_set(key: str, value: str, expire: int = 300) -> None:
    """Stores value in Redis or local in-memory cache with expiry TTL."""
    if redis_available and redis_client:
        try:
            await redis_client.set(key, value, ex=expire)
            return
        except Exception as e:
            logger.error(f"Redis set error: {e}. Storing in in-memory cache.")
    _in_memory_set(key, value, expire)


async def cache_delete(key: str) -> None:
    """Invalidates cache entry in Redis or local in-memory cache."""
    if redis_available and redis_client:
        try:
            await redis_client.delete(key)
            return
        except Exception as e:
            logger.error(f"Redis delete error: {e}. Removing from in-memory cache.")
    _in_memory_delete(key)
