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

    # Check if the uploaded catalog is has at least one required column
    def missingColumn(row):
        columnNames = ["date added",  "track Item", "retailer", "retailer item id", "tld", "upc", "title", "manufacturer", "brand",
                       "client product group", "category", "subcategory", "vat code"]

        checkRow = [rowKey.lower() in columnNames for rowKey in row.keys()]

        return not True in checkRow

     # Error checking for incomplete file upload
    if 'file' not in request.files or request.files['file'].filename == '' or not allowed_file(request.files['file'].filename):
        return {"status": {"error": "Must include a CSV file."}}

    # any way to prevent attacks from loading file?
    if request.files['file']:

        # Delete all existing data in table
        Catalog.query.delete()
        DataAboutCatalog.query.delete()
        db.session.commit()

        # Add TLD and filename from user
        thisCatalog = DataAboutCatalog()
        thisCatalog.thisTLD = request.form["tld"]
        thisCatalog.thisFileName = request.files['file'].filename
        db.session.add(thisCatalog)

        # Allow user's uploaded CSV file to be read by DictReader
        csvfile = TextIOWrapper(request.files['file'], encoding='utf-8')
        reader = csv.DictReader(csvfile)

        # List of csv column names mapped to their Catalog object property names
        fieldnames = {'Date Added': 'date', 'Track Item': 'trackItem', 'Retailer': 'retailer', 'Retailer Item ID': 'retailerItemID', 'TLD': 'tld', 'UPC': 'upc', 'Title': 'title', 'Manufacturer': 'manufacturer',
                      'Brand': 'brand', 'Client Product Group': 'clientProductGroup', 'Category': 'category', 'Subcategory': 'subCategory', 'Amazon Sub Category': 'amazonSubCategory', 'Platform': 'platform', 'VAT Code': 'VATCode'}

        for index, row in enumerate(reader):
            # Check the very first row to see if there is at least one required column present
            if index == 0:
                if missingColumn(row):
                    return {"status": {"error": "Header must have at least one column from: 'Date Added, Track Item, Retailer, Retailer Item ID, TLD, UPC, Title, Manufacturer, Brand, Client Product Group, Category, Subcategory, Amazon Sub Category, Platform, VAT Code'"}}

            saveRow = Catalog()
            for CSVColumnName, catalogPropertyName in fieldnames.items():

                if CSVColumnName in row.keys():
                    setattr(saveRow, catalogPropertyName,
                            row[CSVColumnName])

            # Run error checking on row
            if not errorCheck.checkRowForErrors(saveRow):
                return {"status": {"error": "saveRow must be a Categories object."}}

            db.session.add(saveRow)

        db.session.commit()

        return {"status": {"success": f"{request.files['file'].filename} successfully loaded."}, "fileName": request.files['file'].filename[:201]}


@ app.route('/errorOverview', methods=['GET'])
def errorOverview():

    # dict of all error types
    errorTypes = {'dateError': 0, 'trackItemError': 0, 'retailerError': 0, 'retailerItemIDError': 0, 'tldError': 0, 'upcError': 0, 'titleError': 0,
                  'manufacturerError': 0, 'brandError': 0, 'clientProductGroupError': 0, 'categoryError': 0, 'subCategoryError': 0, 'VATCodeError': 0}

    # count the number of instances for each error type
    for key in errorTypes.keys():
        errorTypes[key] = Catalog.query.filter_by(**{key: True}).count()

    errorTypes['totalCount'] = Catalog.query.count()

    # return JSON of error type with count test
    return errorTypes


@ app.route('/keepaErrorFix', methods=['POST'])
def keepaErrorFix():
    errorFixCount = 0

    # keepaCheckErrors = ["titleError","manufacturerError", "brandError"]

    #    #t = [Catalog.titleError.__eq__(True), Catalog.manufacturerError.__eq__(True), Catalog.brandError.__eq__(True)]

    #     errorColumns = [getattr(Catalog, error[0]).__eq__(True) for error in request.json.items(
    #     ) if error[0] in ["titleError", "manufacturerError", "brandError"] and error[1]]

    #     titleManBrandErrors = Catalog.query.filter(or_(*errorColumns)).all()

    #     if titleManBrandErrors:
    #         errorFixCount += errorCheck.fixCharacterErrors(titleManBrandErrors)
    return 0


@ app.route('/generalErrorFix', methods=['POST'])
def generalErrorFix():

    print("general error fix: ", request.json)

    errorFixCount = 0

    generalErrors = ["dateError", "retailerError", "tldError", "upcError"]

    # Fix all other non-Keepa errors
    if [item for item in request.json if item in generalErrors]:

        errorColumns = [getattr(Catalog, error).__eq__(True) for error in request.json
                        if error in generalErrors]

        allOtherErrors = Catalog.query.filter(or_(*errorColumns)).all()

        if allOtherErrors:
            errorFixCount += errorCheck.fixGeneralErrorsInRow(allOtherErrors)

    db.session.commit()
    return {"status": {"success": f"Repaired {errorFixCount} number of errors."}}


# titleManBrandErrors = Catalog.query.filter(or_(Catalog.titleError == True, Catalog.manufacturerError == True, Catalog.brandError == True)).count()

# Create a CSV file of everything stored in the Catalog table
@ app.route('/downloadCSV', methods=['GET'])
def downloadCSV():

    with open('edited.csv', 'w', newline='') as csvfile:
        fieldnames = {'Date Added': 'date', 'Track Item': 'trackItem', 'Retailer': 'retailer', 'Retailer Item ID': 'retailerItemID', 'TLD': 'tld', 'UPC': 'upc', 'Title': 'title', 'Manufacturer': 'manufacturer',
                      'Brand': 'brand', 'Client Product Group': 'clientProductGroup', 'Category': 'category', 'Subcategory': 'subCategory', 'Amazon Sub Category': 'amazonSubCategory', 'Platform': 'platform', 'VAT Code': 'VATCode'}
        writer = csv.DictWriter(csvfile, fieldnames=[
            column for column in fieldnames], restval='', extrasaction='ignore')

        writer.writeheader()
        allRows = Catalog.query.all()
        for row in allRows:
            row = {csvName: getattr(row, CatalogName, '')
                   for csvName, CatalogName in fieldnames.items()}
            writer.writerow(row)

        send_file(csvfile, attachment_filename="edited.csv")

    return {"status": {"success": "Downloaded edited.csv with your corrections."}}
