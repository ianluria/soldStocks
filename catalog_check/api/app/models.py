from app import db

class Catalog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    