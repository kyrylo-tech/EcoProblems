"""Reverse geocoding: coordinates -> city + street (OpenStreetMap Nominatim, Ukrainian names)."""

import logging
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.config import settings

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class Address:
    city: str | None = None
    street: str | None = None


class Geocoder(Protocol):
    def reverse(self, latitude: float, longitude: float) -> Address: ...


class NominatimGeocoder:
    """Free OSM geocoder. Usage policy: max 1 request/second, identifying User-Agent."""

    _CITY_KEYS = ("city", "town", "village", "hamlet", "municipality")
    _STREET_KEYS = ("road", "pedestrian", "footway", "square", "neighbourhood")

    def reverse(self, latitude: float, longitude: float) -> Address:
        try:
            response = httpx.get(
                settings.geocoder_url,
                params={
                    "lat": latitude,
                    "lon": longitude,
                    "format": "jsonv2",
                    "addressdetails": 1,
                    "zoom": 18,
                    "accept-language": "uk",
                },
                headers={"User-Agent": settings.geocoder_user_agent},
                timeout=settings.geocoder_timeout_seconds,
            )
            response.raise_for_status()
            address = response.json().get("address") or {}
        except (httpx.HTTPError, ValueError) as exc:
            log.warning("Reverse geocoding failed for %s,%s: %s", latitude, longitude, exc)
            return Address()

        city = next((address[k] for k in self._CITY_KEYS if address.get(k)), None)
        road = next((address[k] for k in self._STREET_KEYS if address.get(k)), None)
        house = address.get("house_number")
        street = f"{road}, {house}" if road and house else road
        return Address(city=city, street=street)


def get_geocoder() -> Geocoder:
    return NominatimGeocoder()
