"""cargo unloading GPS coordinates

Revision ID: e9a1b2c3d4e6
Revises: c8f1a2b3d4e5
Create Date: 2026-09-14 13:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e9a1b2c3d4e6"
down_revision: Union[str, None] = "c8f1a2b3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("cargos", sa.Column("unloading_lat", sa.Float(), nullable=True))
    op.add_column("cargos", sa.Column("unloading_lon", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("cargos", "unloading_lon")
    op.drop_column("cargos", "unloading_lat")
