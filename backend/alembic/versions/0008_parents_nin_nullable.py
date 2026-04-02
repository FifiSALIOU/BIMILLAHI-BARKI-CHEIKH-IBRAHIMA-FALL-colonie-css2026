"""Allow NULL on parents.nin.

Revision ID: 0008_parents_nin_nullable
Revises: 0007_parents_telephone_nullable
Create Date: 2026-04-02
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "0008_parents_nin_nullable"
down_revision = "0007_parents_telephone_nullable"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE parents ALTER COLUMN nin DROP NOT NULL;")


def downgrade() -> None:
    op.execute("UPDATE parents SET nin = '-' WHERE nin IS NULL;")
    op.execute("ALTER TABLE parents ALTER COLUMN nin SET NOT NULL;")
