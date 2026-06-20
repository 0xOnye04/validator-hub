from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

# Mock AI responses for demonstration
MOCK_RESPONSES = {
    "stake": "To stake tokens, go to the Staking dashboard, select a validator, and enter the amount you wish to stake.",
    "uptime": "Validator uptime is calculated based on blocks signed. Aim for 99%+ uptime to avoid slashing.",
    "slashing": "Slashing occurs for downtime or double-signing. Keep your validator online and use sentry nodes.",
    "default": "I'm your KiiChain Validator Assistant! Ask me about staking, uptime, slashing, or validator operations."
}

@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest):
    last_message = request.messages[-1].content.lower()
    
    response = MOCK_RESPONSES["default"]
    for keyword, resp in MOCK_RESPONSES.items():
        if keyword in last_message:
            response = resp
            break
    
    return ChatResponse(response=response)
