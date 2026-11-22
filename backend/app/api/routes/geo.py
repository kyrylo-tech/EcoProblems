from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.geocoding import Geocoder, get_geocoder
from app.schemas.catalog import GeoAddress

router = APIRouter(prefix="/geo", tags=["Геолокація"])


@router.get(
    "/reverse",
    summary="Визначити місто й вулицю за координатами",
    description="Для підказки у формі додавання точки після вибору місця на карті. "
    "Якщо адресу не вдалося визначити, поля будуть null.",
)
def reverse_geocode(
    lat: Annotated[float, Query(ge=-90, le=90)],
    lng: Annotated[float, Query(ge=-180, le=180)],
    geocoder: Annotated[Geocoder, Depends(get_geocoder)],
) -> GeoAddress:
    address = geocoder.reverse(lat, lng)
    return GeoAddress(city=address.city, street=address.street)
