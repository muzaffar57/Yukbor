from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class CargoPhoto(Base):
    __tablename__ = "cargo_photos"

    id: Mapped[int] = mapped_column(primary_key=True)
    cargo_id: Mapped[int] = mapped_column(ForeignKey("cargos.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    cargo: Mapped["Cargo"] = relationship(back_populates="photos")  # noqa: F821

    @property
    def url(self) -> str:
        """Rasmga brauzerdan to'g'ridan-to'g'ri kirish uchun havola."""
        return f"/media/{self.file_path}"
