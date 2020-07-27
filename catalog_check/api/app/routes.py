from app import app, db
from app.models import Catalog
from app.errorCheck import checkRowForErrors
from flask import request

# source venv/Scripts/activate


@app.route('/')
@app.route('/index')
def index():
    return 'h'

# Loads file from user into database


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
    if 'file' not in request.files or request.files['file'].filename == '':
        return {"status": {"error": "Must include a CSV file."}}

    # check to make sure file is csv
    # any way to prevent attacks from loading file?
    if request.files['file'] and allowed_file(request.files['file'].filename):

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
                if not checkRowForErrors(saveRow):
                    return {"status": {"error": "saveRow must be a Categories object."}}

                db.session.add(saveRow)

        db.session.commit()
        print(Catalog.query.all())
        return {"status": {"success": f"{request.files['file'].filename} successfully loaded."}}


@app.route('/errorOverview', methods=['GET'])
def errorOverview():

    # list of all error types
    errorTypes = ['dateError', 'trackItemError', 'retailerError', 'retailerItemIDError', 'tldError',  'upcError',  'titleError',
                  'manufacturerError',   'brandError',    'clientProductGroupError',    'categoryError',    'subCategoryError', 'VATCodeError']

    # count the number of instances for each error type

    # return JSON of error type with count
