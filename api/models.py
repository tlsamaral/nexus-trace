from pydantic import BaseModel, Field
from typing import Optional

class Transaction(BaseModel):
    src_account: int = Field(..., description="ID da conta origem")
    dst_account: int = Field(..., description="ID da conta destino")
    amount: float = Field(..., ge=0, description="Valor da transação")
    channel: Optional[str] = Field(default="pix", description="Canal (pix, ted, card, web, mobile)")
