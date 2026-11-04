import asyncio
import uvicorn
from aiogram.webhook.aiohttp_server import SimpleRequestHandler
from aiogram import Bot, Dispatcher
from fastapi import FastAPI, Request
from fastapi.responses import Response

import config
from bot import bot, dp
from server import app  # FastAPI app with /oauth/callback

WEBHOOK_PATH = f"/webhook/{config.BOT_TOKEN}"
WEBHOOK_URL  = f"{config.RENDER_URL}{WEBHOOK_PATH}"

@app.on_event("startup")
async def on_startup():
    await bot.set_webhook(WEBHOOK_URL)

@app.on_event("shutdown")
async def on_shutdown():
    await bot.delete_webhook()

@app.post(WEBHOOK_PATH)
async def telegram_webhook(request: Request):
    update = await request.json()
    from aiogram.types import Update
    tg_update = Update(**update)
    await dp.feed_update(bot, tg_update)
    return Response()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=10000)
