from typing import Optional

_tokens: dict[str, dict] = {}  # keyed by telegram user_id or state param

def save_token(state: str, token_data: dict) -> None:
    _tokens[state] = token_data

def get_token(state: str) -> Optional[dict]:
    return _tokens.get(state)

def list_tokens() -> dict:
    return dict(_tokens)
