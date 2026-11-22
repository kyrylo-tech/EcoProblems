"""Ukrainian error messages for validation and generic HTTP errors."""

from typing import Any

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exception_handlers import http_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

_MESSAGES: dict[str, str] = {
    "missing": "Обов'язкове поле",
    "string_type": "Має бути рядком",
    "string_too_short": "Мінімальна довжина — {min_length} симв.",
    "string_too_long": "Максимальна довжина — {max_length} симв.",
    "too_short": "Потрібно щонайменше {min_length} ел.",
    "too_long": "Не більше {max_length} ел.",
    "int_type": "Має бути цілим числом",
    "int_parsing": "Має бути цілим числом",
    "float_type": "Має бути числом",
    "float_parsing": "Має бути числом",
    "bool_type": "Має бути true або false",
    "bool_parsing": "Має бути true або false",
    "greater_than": "Має бути більше {gt}",
    "greater_than_equal": "Має бути не менше {ge}",
    "less_than": "Має бути менше {lt}",
    "less_than_equal": "Має бути не більше {le}",
    "enum": "Допустимі значення: {expected}",
    "literal_error": "Допустимі значення: {expected}",
    "time_type": "Некоректний час, очікується формат ГГ:ХХ",
    "time_parsing": "Некоректний час, очікується формат ГГ:ХХ",
    "list_type": "Має бути списком",
    "dict_type": "Має бути об'єктом",
    "model_type": "Має бути об'єктом",
    "model_attributes_type": "Має бути об'єктом",
    "json_invalid": "Некоректний JSON",
    "json_type": "Некоректний JSON",
    "extra_forbidden": "Невідоме поле",
    "uuid_parsing": "Некоректний ідентифікатор",
}

_HTTP_DEFAULTS: dict[str, str] = {
    "Not Found": "Не знайдено",
    "Method Not Allowed": "Метод не дозволено",
    "Unauthorized": "Потрібна авторизація",
    "Forbidden": "Доступ заборонено",
    "Not authenticated": "Потрібна авторизація",
}


def _translate(error: dict[str, Any]) -> str:
    err_type = error.get("type", "")
    msg = str(error.get("msg", ""))
    ctx = error.get("ctx") or {}

    if err_type == "value_error":
        if "email address" in msg:
            return "Некоректна адреса електронної пошти"
        # Our own validators raise ValueError with Ukrainian text; drop pydantic's prefix
        return msg.removeprefix("Value error, ")
    if err_type == "assertion_error":
        return msg.removeprefix("Assertion failed, ")

    template = _MESSAGES.get(err_type)
    if template is None:
        return msg
    # 90.0 -> 90 for float bounds
    ctx = {k: int(v) if isinstance(v, float) and v.is_integer() else v for k, v in ctx.items()}
    try:
        return template.format(**ctx)
    except (KeyError, IndexError):
        return template.split(":")[0]


async def _validation_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    detail = [
        {"loc": list(err.get("loc", ())), "msg": _translate(err), "type": err.get("type")} for err in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(detail)})


async def _http_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    if isinstance(exc.detail, str) and exc.detail in _HTTP_DEFAULTS:
        exc = StarletteHTTPException(exc.status_code, _HTTP_DEFAULTS[exc.detail], headers=exc.headers)
    return await http_exception_handler(request, exc)


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, _validation_handler)
    app.add_exception_handler(StarletteHTTPException, _http_handler)
