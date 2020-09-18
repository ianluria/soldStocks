from app import db


class Metadata(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    thisFileName = db.Column(db.String(1000))

    def __repr__(self):
        return f'<File: {self.thisFileName}>'


class Sales(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    date = db.Column(db.Date())
    priceSold = db.Column(db.String(100))
    ticker = db.Column(db.String(10))
    shares = db.Column(db.String(50))

    def __repr__(self):
        return f'<Ticker: {self.ticker} sold on {self.date}>'
