import os

BOT_TOKEN      = os.environ["BOT_TOKEN"]          # telegram bot token
RENDER_URL     = os.environ["RENDER_URL"]          # https://your-app.onrender.com
GALLERY_CLIENT_ID     = os.environ["GALLERY_CLIENT_ID"]
GALLERY_CLIENT_SECRET = os.environ["GALLERY_CLIENT_SECRET"]
GALLERY_AUTH_URL      = os.environ["GALLERY_AUTH_URL"]   # platform OAuth authorize endpoint
GALLERY_TOKEN_URL     = os.environ["GALLERY_TOKEN_URL"]  # platform token exchange endpoint
GALLERY_SCOPES        = os.environ.get("GALLERY_SCOPES", "read write")
