from app import app, db
from app.models import Catalog, DataAboutCatalog
from app import errorCheck
from flask import request, send_file
import re
import json
import csv

from datetime import datetime, timedelta, date
from sqlalchemy import or_
from io import TextIOWrapper


# source venv/Scripts/activate


@app.route('/')
@app.route('/index')
def index():
    return 'home page'

# Check if there is a catalog already loaded in database


@app.route('/checkForLoadedCatalog', methods=['GET'])
def checkForLoadedCatalog():
    first = Catalog.query.first()
    if not first:
        return {"loaded": False}
    else:
        catalogData = DataAboutCatalog.query.first()
        return {"loaded": True, "thisTLD": catalogData.thisTLD, "thisFileName": catalogData.thisFileName}


# Loads CSV file from user into database
@app.route('/loadCSV', methods=['PUT'])
def loadCSV():

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv'}

    # Check if the uploaded catalog is has at least required columns
    def missingColumn(row):
        columnNames = ["ticker", "date sold"]

        checkRow = [columnName in row for columnName in columnNames]

        return not True in checkRow

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
        fieldnames = {"ticker": "ticker", "date sold": "dateSold"}

        for index, row in enumerate(reader):
            # Check the very first row to see if there is at least one required column present
            if index == 0:
                if missingColumn(row):
                    return {"status": {"error": "Header must have at least one column from: 'ticker', 'date sold'"}}

            saveRow = Sales()

            for CSVColumnName, catalogPropertyName in fieldnames.items():
                if CSVColumnName in row.keys():
                    setattr(saveRow, catalogPropertyName,
                            row[CSVColumnName])

            # Run error checking on row
            if not errorCheck.checkRowForErrors(saveRow):
                return {"status": {"error": "saveRow must be a Sales object."}}

            db.session.add(saveRow)

        db.session.commit()

        return {"status": {"success": f"{request.files['file'].filename} successfully loaded."}, "fileName": request.files['file'].filename[:201]}


# @ app.route('/errorOverview', methods=['GET'])
# def errorOverview():

#     # dict of all error types
#     errorTypes = {'dateError': 0, 'tickerError': 0, 'priceError': 0}

#     # count the number of instances for each error type
#     for key in errorTypes.keys():
#         errorTypes[key] = Sales.query.filter_by(**{key: True}).count()

#     errorTypes['totalCount'] = Sales.query.count()

#     # return JSON of error type with count test
#     return errorTypes


# @ app.route('/generalErrorFix', methods=['POST'])
# def generalErrorFix():

#     print("general error fix: ", request.json)

#     errorFixCount = 0

#     generalErrors = ["dateError", "retailerError", "tldError", "upcError"]

#     # Fix all other non-Keepa errors
#     if [item for item in request.json if item in generalErrors]:

#         errorColumns = [getattr(Catalog, error).__eq__(True) for error in request.json
#                         if error in generalErrors]

#         allOtherErrors = Catalog.query.filter(or_(*errorColumns)).all()

#         if allOtherErrors:
#             errorFixCount += errorCheck.fixGeneralErrorsInRow(allOtherErrors)

#     db.session.commit()
#     return {"status": {"success": f"Repaired {errorFixCount} number of errors."}}


# titleManBrandErrors = Catalog.query.filter(or_(Catalog.titleError == True, Catalog.manufacturerError == True, Catalog.brandError == True)).count()

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
