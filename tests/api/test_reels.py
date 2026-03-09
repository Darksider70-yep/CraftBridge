def _create_artisan_profile(client, headers: dict[str, str]) -> None:
    artisan_response = client.post(
        "/api/v1/artisans/create",
        json={
            "name": "Craft Reels Studio",
            "bio": "Traditional crafts in motion.",
            "location": "Udaipur",
            "craft_type": "Pottery",
        },
        headers=headers,
    )
    assert artisan_response.status_code == 201


def test_upload_reel_and_fetch_feed(client, artisan_headers) -> None:
    _create_artisan_profile(client, artisan_headers)

    upload_response = client.post(
        "/api/v1/reels/upload",
        data={"caption": "Clay shaping process."},
        files={"video": ("process.mp4", b"fake-video-bytes", "video/mp4")},
        headers=artisan_headers,
    )
    assert upload_response.status_code == 201
    reel = upload_response.json()
    assert reel["caption"] == "Clay shaping process."
    assert reel["video_url"].startswith("https://storage.test.local")

    feed_response = client.get("/api/v1/reels/feed")
    assert feed_response.status_code == 200
    feed = feed_response.json()
    assert len(feed) == 1
    assert feed[0]["id"] == reel["id"]
