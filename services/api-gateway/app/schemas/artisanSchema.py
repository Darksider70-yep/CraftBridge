from pydantic import BaseModel, Field


class ArtisanCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    bio: str | None = Field(default=None, max_length=2000)
    location: str | None = Field(default=None, max_length=255)
    craft_type: str | None = Field(default=None, max_length=120)
    profile_image: str | None = Field(default=None, max_length=500)


class ArtisanResponse(BaseModel):
    id: str
    user_id: str
    name: str
    bio: str | None
    location: str | None
    craft_type: str | None
    profile_image: str | None
    verified: bool
