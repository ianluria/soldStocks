from app import app, db
from app.models import Catalog
from app import errorCheck
from flask import request
import re
import json

from datetime import datetime, timedelta, date
from sqlalchemy import or_


# source venv/Scripts/activate


@app.route('/')
@app.route('/index')
def index():
    return 'home page'


@app.route('/checkForLoadedCatalog', methods=['GET'])
def checkForLoadedCatalog():
    first = Catalog.query.first()
    if not first:
        return {"loaded": False}
    else:
        return {"loaded": True}

# Loads CSV file from user into database


@app.route('/loadCSV', methods=['PUT'])
def loadCSV():

    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in {'csv'}

    def checkHeaderRow(row):
        columnNames = {0: "date added", 1: "track Item", 2: "retailer", 3: "Retailer Item ID", 4: "tld", 5: "upc", 6: "title", 7: "Manufacturer", 8: "Brand",
                       9: "Client Product Group", 10: "Category", 11: "Subcategory", 14: "VAT Code"}

        for key, value in columnNames.items():
            if row[key].strip().lower() != value.lower():
                return False

        return True

     # Error checking for incomplete file upload
    if 'file' not in request.files or request.files['file'].filename == '' or not allowed_file(request.files['file'].filename):
        return {"status": {"error": "Must include a CSV file."}}

    # check to make sure file is csv
    # any way to prevent attacks from loading file?
    if request.files['file']:

        # Delete all existing data in table
        Catalog.query.delete()
        db.session.commit()

        for index, row in enumerate(request.files['file']):
            # Create a list with row's data
            row = row.decode("utf-8").split(',')
            # error check first row to ensure it is a list of column names and that it is in the proper order
            if index == 0:
                if not checkHeaderRow(row):
                    return {"status": {"error": "Header must be formatted as: 'Date Added, Track Item, Retailer, Retailer Item ID, TLD, UPC, Title, Manufacturer, Brand, Client Product Group, Category, Subcategory, Amazon Sub Category, Platform, VAT Code'"}}

            # Ignore first line which is the column names header row
            if index > 0:
                saveRow = Catalog()

                saveRow.date = row[0].strip()
                saveRow.trackItem = row[1].strip()
                saveRow.retailer = row[2].strip()
                saveRow.retailerItemID = row[3].strip()
                saveRow.tld = row[4].strip()
                saveRow.upc = row[5].strip()
                saveRow.title = row[6].strip()
                saveRow.manufacturer = row[7].strip()
                saveRow.brand = row[8].strip()
                saveRow.clientProductGroup = row[9].strip()
                saveRow.category = row[10].strip()
                saveRow.subCategory = row[11].strip()
                saveRow.VATCode = row[14].strip()

                # Run error checking on row
                if not errorCheck.checkRowForErrors(saveRow):
                    return {"status": {"error": "saveRow must be a Categories object."}}

                db.session.add(saveRow)

        db.session.commit()

        return {"status": {"success": f"{request.files['file'].filename} successfully loaded."}}


@app.route('/errorOverview', methods=['GET'])
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

@app.route('/keepaErrorFix', methods=['POST'])
def keepaErrorFix():
        errorFixCount = 0

    # keepaCheckErrors = ["titleError","manufacturerError", "brandError"]

    
    #    #t = [Catalog.titleError.__eq__(True), Catalog.manufacturerError.__eq__(True), Catalog.brandError.__eq__(True)]

    #     errorColumns = [getattr(Catalog, error[0]).__eq__(True) for error in request.json.items(
    #     ) if error[0] in ["titleError", "manufacturerError", "brandError"] and error[1]]

    #     titleManBrandErrors = Catalog.query.filter(or_(*errorColumns)).all()

    #     if titleManBrandErrors:
    #         errorFixCount += errorCheck.fixCharacterErrors(titleManBrandErrors)





@app.route('/generalErrorFix', methods=['POST'])
def generalErrorFix():

    print(request.json)
    errorFixCount = 0

    generalErrors = ["dateError", "retailerError", "tldError", "upcError"]


    # Fix all other non-Keepa errors
    if [item for item in request.json.items() if item[1] and item[0] in generalErrors]:

        errorColumns = [getattr(Catalog, error[0]).__eq__(True) for error in request.json.items()
                        if error[0] in generalErrors and error[1]]

        allOtherErrors = Catalog.query.filter(or_(*errorColumns)).all()

        if allOtherErrors:
            errorFixCount += errorCheck.fixGeneralErrorsInRow(allOtherErrors)

    db.session.commit()
    return {"status": {"success": f"Repaired {errorFixCount} number of errors."}}


#titleManBrandErrors = Catalog.query.filter(or_(Catalog.titleError == True, Catalog.manufacturerError == True, Catalog.brandError == True)).count()
