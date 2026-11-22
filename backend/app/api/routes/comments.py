from fastapi import APIRouter, HTTPException, Response, status

from app.db import DbSession
from app.deps import CurrentUser
from app.models import Comment

router = APIRouter(prefix="/comments", tags=["Коментарі"])


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Видалити коментар")
def delete_comment(comment_id: int, db: DbSession, user: CurrentUser) -> Response:
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Коментар не знайдено")
    if not (user.is_admin or comment.author_id == user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Видалити коментар може лише його автор або адміністратор")
    db.delete(comment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
