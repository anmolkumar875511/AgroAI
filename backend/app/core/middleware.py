"""Security middleware for rate limiting, audit logging, and input validation."""
import time
import re
from typing import Optional, Callable
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

# Simple in-memory rate limiter (use Redis in production)
_rate_limit_store: dict = {}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware - prevents brute force and DoS attacks."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health check
        if request.url.path == "/health":
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        key = f"{client_ip}:{path}"
        
        now = time.time()
        window = settings.RATE_LIMIT_WINDOW
        max_requests = settings.RATE_LIMIT_REQUESTS
        
        if key not in _rate_limit_store:
            _rate_limit_store[key] = []
        
        # Clean old entries
        _rate_limit_store[key] = [
            ts for ts in _rate_limit_store[key] if now - ts < window
        ]
        
        if len(_rate_limit_store[key]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {max_requests} requests per {window} seconds.",
            )
        
        _rate_limit_store[key].append(now)
        
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000;"
        )
        
        return response


class AuditLogMiddleware(BaseHTTPMiddleware):
    """Log all API requests for audit trail."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Log request details
        duration = time.time() - start_time
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        status_code = response.status_code
        
        # Only log non-health requests
        if path != "/health":
            print(
                f"[AUDIT] {client_ip} | {method} {path} | "
                f"Status: {status_code} | Duration: {duration:.3f}s"
            )
        
        return response


# Input sanitization
def sanitize_string(value: Optional[str], max_length: int = 1000) -> Optional[str]:
    """Sanitize string input - remove potentially dangerous characters."""
    if not value:
        return value
    
    # Trim whitespace
    value = value.strip()
    
    # Limit length
    if len(value) > max_length:
        value = value[:max_length]
    
    # Remove null bytes
    value = value.replace("\x00", "")
    
    # Basic XSS prevention - remove script tags
    value = re.sub(r"<script[^>]*>.*?</script>", "", value, flags=re.DOTALL | re.IGNORECASE)
    value = re.sub(r"javascript:", "", value, flags=re.IGNORECASE)
    value = re.sub(r"on\w+\s*=", "", value, flags=re.IGNORECASE)
    
    return value
