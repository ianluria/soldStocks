from app import db


class DataAboutCatalog(db.Model):
    thisTLD = db.Column(db.String(5), unique=True)
    thisFileName = db.Column(db.String(1000), primary_key=True)

    def __repr__(self):
        return f'<Catalog file: {self.thisFileName}>'


class Catalog(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    date = db.Column(db.String(100))
    dateError = db.Column(db.Boolean())
    trackItem = db.Column(db.String(1000))
    trackItemError = db.Column(db.Boolean())
    retailer = db.Column(db.String(500))
    retailerError = db.Column(db.Boolean())
    retailerItemID = db.Column(db.String(1000), index=True, unique=True)
    retailerItemIDError = db.Column(db.Boolean())
    tld = db.Column(db.String(500))
    tldError = db.Column(db.Boolean())
    upc = db.Column(db.String(1000))
    upcError = db.Column(db.Boolean())
    title = db.Column(db.String(5000))
    titleError = db.Column(db.Boolean())
    manufacturer = db.Column(db.String(2000))
    manufacturerError = db.Column(db.Boolean())
    brand = db.Column(db.String(2000))
    brandError = db.Column(db.Boolean())
    clientProductGroup = db.Column(db.String(2000))
    clientProductGroupError = db.Column(db.Boolean())
    category = db.Column(db.String(2000))
    categoryError = db.Column(db.Boolean())
    subCategory = db.Column(db.String(2000))
    subCategoryError = db.Column(db.Boolean())
    VATCode = db.Column(db.String(2000))
    VATCodeError = db.Column(db.Boolean())
    amazonSubCategory = db.Column(db.String(2000))
    platform = db.Column(db.String(2000))

    def __repr__(self):
        return f'<Product ASIN {self.retailerItemID}>'
