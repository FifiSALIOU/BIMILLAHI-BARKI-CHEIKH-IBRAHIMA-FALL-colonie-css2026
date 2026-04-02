"""Allow NULL on parents.telephone.

Revision ID: 0007_parents_telephone_nullable
Revises: 0006_resequence_rang_dans_liste
Create Date: 2026-04-02
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "0007_parents_telephone_nullable"
down_revision = "0006_resequence_rang_dans_liste"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE parents ALTER COLUMN telephone DROP NOT NULL;")


def downgrade() -> None:
    # Ensure no NULL remains before restoring NOT NULL.
    op.execute("UPDATE parents SET telephone = '-' WHERE telephone IS NULL;")
    op.execute("ALTER TABLE parents ALTER COLUMN telephone SET NOT NULL;")
