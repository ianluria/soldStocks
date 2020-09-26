"""empty message

Revision ID: dcf8dcb8b826
Revises: 
Create Date: 2020-09-25 20:38:37.418155

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dcf8dcb8b826'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('metadata',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('thisFileName', sa.String(length=1000), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sales',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('priceSold', sa.String(length=100), nullable=True),
    sa.Column('ticker', sa.String(length=10), nullable=True),
    sa.Column('shares', sa.String(length=50), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('sales')
    op.drop_table('metadata')
    # ### end Alembic commands ###
