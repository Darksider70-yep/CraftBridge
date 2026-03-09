from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any


@dataclass
class ReelRankedItem:
    id: str
    likes: int
    views: int
    created_at: datetime
    payload: Any
    score: float


class FeedEngine:
    @staticmethod
    def rank_reels(reels: list[dict[str, Any]]) -> list[ReelRankedItem]:
        ranked: list[ReelRankedItem] = []
        for reel in reels:
            created_at = reel.get("created_at")
            if not isinstance(created_at, datetime):
                created_at = datetime.now(tz=UTC)
            likes = int(reel.get("likes", 0))
            views = int(reel.get("views", 0))
            freshness_factor = FeedEngine._freshness_factor(created_at)
            score = (likes * 3) + (views * 1) + freshness_factor
            ranked.append(
                ReelRankedItem(
                    id=str(reel.get("id")),
                    likes=likes,
                    views=views,
                    created_at=created_at,
                    payload=reel,
                    score=score,
                )
            )

        return sorted(ranked, key=lambda item: item.score, reverse=True)

    @staticmethod
    def _freshness_factor(created_at: datetime) -> float:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        now = datetime.now(tz=UTC)
        age_hours = max((now - created_at).total_seconds() / 3600, 0)
        return max(0.0, 72.0 - age_hours)
