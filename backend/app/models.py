from typing import Literal
from pydantic import BaseModel, Field, HttpUrl, field_validator

class CreateInvestigationRequest(BaseModel):
    supplier_name: str = Field(min_length=2, max_length=200)
    website: str = Field(default="", max_length=300)
    category: str = Field(min_length=2, max_length=120)
    region: str = Field(default="", max_length=120)
    description: str = Field(default="", max_length=2000)
    claims: list[str] = Field(min_length=1, max_length=15)
    additional_context: str = Field(default="", max_length=3000)

    @field_validator("supplier_name", "category")
    @classmethod
    def trim_required(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty.")
        return value

    @field_validator("claims")
    @classmethod
    def clean_claims(cls, values: list[str]) -> list[str]:
        cleaned = [v.strip() for v in values if isinstance(v, str) and len(v.strip()) >= 3]
        if not cleaned:
            raise ValueError("Add at least one claim of three or more characters.")
        if len(cleaned) > 15:
            raise ValueError("A maximum of 15 claims is allowed per investigation.")
        return cleaned

    @field_validator("website")
    @classmethod
    def validate_website(cls, value: str) -> str:
        value = value.strip()
        if value and not value.startswith(("https://", "http://")):
            raise ValueError("Website must start with https:// or http://.")
        return value

class CompareRequest(BaseModel):
    investigation_ids: list[str] = Field(min_length=2, max_length=3)
