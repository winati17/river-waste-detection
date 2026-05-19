from pydantic import BaseModel

class ProcessRequest(BaseModel):
    model_name: str
    confidence: float