"""empty message

Revision ID: 6e0ca4b57fb9
Revises: 
Create Date: 2020-07-26 22:03:42.975888

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6e0ca4b57fb9'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('catalog',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('dateError', sa.Boolean(), nullable=True),
    sa.Column('trackItem', sa.String(length=2000), nullable=True),
    sa.Column('trackItemError', sa.Boolean(), nullable=True),
    sa.Column('retailer', sa.String(length=2000), nullable=True),
    sa.Column('retailerError', sa.Boolean(), nullable=True),
    sa.Column('retailerItemID', sa.String(length=1000), nullable=True),
    sa.Column('retailerItemIDError', sa.Boolean(), nullable=True),
    sa.Column('tld', sa.String(length=2000), nullable=True),
    sa.Column('tldError', sa.Boolean(), nullable=True),
    sa.Column('upc', sa.String(length=2000), nullable=True),
    sa.Column('upcError', sa.Boolean(), nullable=True),
    sa.Column('title', sa.String(length=5000), nullable=True),
    sa.Column('titleError', sa.Boolean(), nullable=True),
    sa.Column('manufacturer', sa.String(length=2000), nullable=True),
    sa.Column('manufacturerError', sa.Boolean(), nullable=True),
    sa.Column('brand', sa.String(length=2000), nullable=True),
    sa.Column('brandError', sa.Boolean(), nullable=True),
    sa.Column('clientProductGroup', sa.String(length=2000), nullable=True),
    sa.Column('clientProductGroupError', sa.Boolean(), nullable=True),
    sa.Column('category', sa.String(length=2000), nullable=True),
    sa.Column('categoryError', sa.Boolean(), nullable=True),
    sa.Column('subCategory', sa.String(length=2000), nullable=True),
    sa.Column('subCategoryError', sa.Boolean(), nullable=True),
    sa.Column('VATCode', sa.String(length=2000), nullable=True),
    sa.Column('VATCodeError', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_catalog_retailerItemID'), 'catalog', ['retailerItemID'], unique=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_catalog_retailerItemID'), table_name='catalog')
    op.drop_table('catalog')
    # ### end Alembic commands ###
