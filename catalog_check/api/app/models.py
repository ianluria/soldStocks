from app import db

class Catalog(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    date = db.Column(db.Date())
    dateError = = db.Column(db.Boolean()) 
    trackItem = db.Column(db.String(200))
    trackItemError = db.Column(db.Boolean())
    retailer = db.Column(db.String(200))
    retailerError = db.Column(db.Boolean())
    retailerItemID = db.Column(db.String(10), index=True, unique=True)
    retailerItemIDError = db.Column(db.Boolean())
    tld = db.Column(db.String(200))
    tldError = db.Column(db.Boolean())
    upc = db.Column(db.String(200))
    upcError = db.Column(db.Boolean())
    title = db.Column(db.String(500))
    titleError = db.Column(db.Boolean())
    manufacturer = db.Column(db.String(200))
    manufacturerError = db.Column(db.Boolean())
    brand = db.Column(db.String(200))
    brandError = db.Column(db.Boolean())
    clientProductGroup = db.Column(db.String(200))
    clientProductGroupError = db.Column(db.Boolean())
    category = db.Column(db.String(200))
    categoryError = db.Column(db.Boolean())
    subCategory = db.Column(db.String(200))
    subCategoryError = db.Column(db.Boolean())

    def __repr__(self):
        return f'<Product ASIN {self.retailerItemID}>'
