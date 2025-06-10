from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from jose import JWTError, jwt
from configs.config import settings

class AuthorizeRequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # List of paths that don't require token verification
        exact_paths = [
            "/docs", 
            "/openapi.json", 
            "/auth/signup", 
            "/auth/signin",
            "/"
        ]
        
        # Path prefixes that don't require authentication
        prefix_paths = [
            "/uploads/"  # This will match /uploads/anything
        ]
        
        # Check if path matches any exact path
        if request.url.path in exact_paths:
            return await call_next(request)
            
        # Check if path starts with any excluded prefix
        if any(request.url.path.startswith(prefix) for prefix in prefix_paths):
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)

        bearer_token = request.headers.get("Authorization")
        if not bearer_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "detail": "Missing access token",
                },
            )
        try:
            auth_token = bearer_token.split(" ")[1].strip()
            token_payload = jwt.decode(auth_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except (
            JWTError,
        ) as error:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": str(error)},
            )
        else:
            request.state.user_id = token_payload["sub"]
        return await call_next(request)