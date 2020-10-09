from app import app, db
from app.models import Sales, Metadata
from flask import request, send_file
import re
import json
import csv
import decimal


from datetime import date
from sqlalchemy import or_
from io import TextIOWrapper


# source venv/Scripts/activate


@app.route('/')
@app.route('/index')
def index():
    return 'home page'

# query database and group results by ticker symbol and by date
# get historical price information for any missing historical sales
# restructure list into a dict for return


@app.route('/generateSalesPerformance')
def generateSalesPerformance():

    # Generate a list of unique ticker symbols
    distinctTickers = Sales.query.distinct(Sales.ticker).all()

    # Set of unique tickers
    tickers = {sale.ticker for sale in distinctTickers}

    # Create a dictionary with each ticker
    formattedSales = {ticker: {"history": [], "currentPrice": 0}
                      for ticker in tickers}

    # consider making a tuple
    sales = Sales.query.order_by(Sales.ticker, Sales.date).all()

    for sale in sales:

        thisSalesDetails = {"date": sale.date.isoformat(),
                            # Convert to decimal format
                            "priceSold": str(decimal.Decimal(sale.priceSold).quantize(decimal.Decimal('1.00'))),
                            "shares": sale.shares}
        # Add this sale's details to the history list for the respective ticker
        formattedSales[sale.ticker]["history"].append(thisSalesDetails)

    return formattedSales


# Check if there is a catalog already loaded in database
@app.route('/checkForLoadedSales', methods=['GET'])
def checkForLoadedSales():
    first = Sales.query.first()
    if not first:
        return {"loaded": False}
    else:
        salesDatabase = Metadata.query.first()
        return {"loaded": True, "thisFileName": salesDatabase.thisFileName}


# Loads CSV file from user into database
@app.route('/loadCSV', methods=['PUT'])
def loadCSV():

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv'}

     # Error checking for incomplete file upload
    if 'file' not in request.files or request.files['file'].filename == '' or not allowed_file(request.files['file'].filename):
        return {"status": {"error": "Must include a CSV file."}}

    # any way to prevent attacks from loading file?
    if request.files['file']:

        # Delete all existing data in table
        Sales.query.delete()
        db.session.commit()

        # Allow user's uploaded CSV file to be read by DictReader
        csvfile = TextIOWrapper(request.files['file'], encoding='utf-8')
        reader = csv.DictReader(csvfile)

        # Dictionary of csv column names mapped to their Sales object property names
        fieldnames = {"ticker": "ticker", "date": "date",
                      "price": "priceSold", "shares": "shares"}

        requiredFields = [f for f in fieldnames if f != "price"]

        # list of dicts with {"row":[],"errors":[]}
        listOfErrors = []

        # row is a dictionary
        for index, row in enumerate(reader):

            # Error checking
            thisRowsErrors = {"index": index, "row": row, "errors": []}

            # Check that required fields are complete for this row
            missingFieldErrors = [
                column for column in row if column in requiredFields and row[column] == '']

            # Check if there is at least one error in missingFieldErrors
            missingFieldErrorsLength = len(missingFieldErrors)
            if missingFieldErrorsLength > 0:
                newError = 'The required fields: '
                # Add each missing field to the error string
                for fieldError in range(missingFieldErrorsLength):
                    # Only add comma and space to elements that aren't the last
                    if fieldError < missingFieldErrorsLength - 1:
                        newError += missingFieldErrors[fieldError] + ", "
                    else:
                        newError += missingFieldErrors[fieldError] + " "
                newError += "are missing in this row."
                thisRowsErrors["errors"].append(newError)

            # Check that the date cell can be converted into a date object
            try:
                # Must exactly be of format YYYY-MM-DD
                row["date"] = date.fromisoformat(row["date"])
            except (ValueError, TypeError):
                thisRowsErrors["errors"].append(
                    "Date must be EXACTLY of format YYYY-MM-DD.")

            # Check that the date is in the proper range
            if row["date"] > date.today():
                thisRowsErrors["errors"].append(
                    "Sale date cannot be greater than today.")
            elif row["date"] < date(1990, 1, 1):
                thisRowsErrors["errors"].append(
                    "Sale date cannot be less than 1990.")

            # Shares must be a positive non-zero number
            if row["shares"] <= 0:
                thisRowsErrors["errors"].append(
                    "Shares must be a positive non-zero number.")

            # If there are any errors, do not add row to database
            # Add the row's error information to the master listOfErrors
            if len(thisRowsErrors["errors"]) > 0:
                listOfErrors.append(thisRowsErrors)
                continue

            # if row is missing price fill in with data that will signal the need to get that data from API
            if not row["price"]:
                row["price"] = "missing"

            saveRow = Sales()

            for csvName, databaseName in fieldnames.items():

                setattr(saveRow, databaseName, row[csvName])

            db.session.add(saveRow)

        # Only commit the session if actual data has been added to the table
        if Sales.query.first():

            # Add data about this file
            thisMetadata = Metadata()
            thisMetadata.thisFileName = request.files['file'].filename[:999]
            db.session.add(thisMetadata)

            db.session.commit()

            return {"status": {"success": f"{request.files['file'].filename[:201]} successfully loaded."}, "fileName": request.files['file'].filename[:201], "errors": listOfErrors}
        else:
            return {"status": {"error": "No rows were added to the database due to errors in your data."}}

# Create a CSV file of everything stored in the Catalog table


@ app.route('/downloadCSV', methods=['GET'])
def downloadCSV():

    with open('edited.csv', 'w', newline='') as csvfile:
        fieldnames = {"ticker": "ticker", "date sold": "dateSold",
                      "price sold": "priceSold", "current price": "currentPrice"}
        writer = csv.DictWriter(csvfile, fieldnames=[
            column for column in fieldnames], restval='', extrasaction='ignore')

        writer.writeheader()
        allRows = Sales.query.all()
        for row in allRows:
            row = {CSVName: getattr(row, DatabaseName, '')
                   for CSVName, DatabaseName in fieldnames.items()}
            writer.writerow(row)

        send_file(csvfile, attachment_filename="edited.csv")

    return {"status": {"success": "Downloaded edited.csv."}}
