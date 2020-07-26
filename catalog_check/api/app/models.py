from app import db

class Catalog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(200))
    trackItem = db.Column(db.String(200))
    retailer = db.Column(db.String(200))
    retailerItemID = db.Column(db.String(10), index=True, unique=True)
    tld = db.Column(db.String(200))
    upc = db.Column(db.String(200))
    title = db.Column(db.String(500))
    manufacturer = db.Column(db.String(200))
    brand = db.Column(db.String(200))
    clientProductGroup = db.Column(db.String(200))
    category = db.Column(db.String(200))
    subCategory = db.Column(db.String(200))

    def __repr__(self):
        return f'<Product ASIN {self.asin}>'
