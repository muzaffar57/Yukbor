from datetime import datetime

from pydantic import BaseModel, Field


class SubscriptionExtendRequest(BaseModel):
    days: int = Field(gt=0, le=3650, description="Obunani necha kunga uzaytirish kerak")


class SubscriptionExtendResponse(BaseModel):
    user_id: int
    phone_number: str
    subscription_expires_at: datetime
