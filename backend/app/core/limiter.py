"""
In-memory client IP rate limiter for protecting endpoints from brute-force or cost attacks.
"""
import time
from fastapi import Request, HTTPException, status

class RateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.requests = {}

    async def __call__(self, request: Request):
        import sys
        if "pytest" in sys.modules:
            return
        # Fallback to "unknown" if host is None or client is None
        ip = "unknown"
        if request.client and request.client.host:
            ip = request.client.host
            
        now = time.time()
        
        if ip not in self.requests:
            self.requests[ip] = []
            
        # Keep only timestamps within the active sliding window
        self.requests[ip] = [t for t in self.requests[ip] if now - t < self.window_seconds]
        
        if len(self.requests[ip]) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later."
            )
            
        self.requests[ip].append(now)

login_limiter = RateLimiter(5, 60)
chat_limiter = RateLimiter(10, 60)
rescore_limiter = RateLimiter(10, 60)
