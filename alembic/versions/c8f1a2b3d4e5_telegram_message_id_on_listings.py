"""telegram_message_id — kanal postini yopilganda tahrirlash uchun

Revision ID: c8f1a2b3d4e5
Revises: d357e0ac5e6d
Create Date: 2026-09-14 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c8f1a2b3d4e5"
down_revision: Union[str, None] = "d357e0ac5e6d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("cargos", sa.Column("telegram_message_id", sa.Integer(), nullable=True))
    op.add_column("driver_offers", sa.Column("telegram_message_id", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("driver_offers", "telegram_message_id")
    op.drop_column("cargos", "telegram_message_id")
