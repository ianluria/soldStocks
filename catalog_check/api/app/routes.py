from app import app
# source venv/Scripts/activate


@app.route('/')
@app.route('/index')
def index():
    return 'h'


@app.route('/loadCSV', methods=['PUT'])
def loadCSV():
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in {'csv'}

    def checkHeaderRow(row):
        columnNames = {3: "Retailer Item ID", 7: "Manufacturer", 8: "Brand",
                       9: "Client Product Group", 10: "Category", 11: "Subcategory"}

        for key, value in columnNames.items():
            if row[key].strip().lower() != value.lower():
                return False

        return True

     # Error checking for incomplete file upload
    if 'file' not in request.files or request.files['file'].filename == '':
        return {"error": "Must include a CSV file."}

    # check to make sure file is csv
    # any way to prevent attacks from loading file?
    if request.files['file'] and allowed_file(request.files['file'].filename):

        # Delete all existing data in table
        Categories.query.delete()
        db.session.commit()

        for index, row in enumerate(request.files['file']):
            # Create a list with row's data
            row = row.decode("utf-8").split(',')
            print("row: ", row)
            # error check first row to ensure it is a list of column names and that it is in the proper order
            if index == 0:
                if not checkHeaderRow(row):
                    return {"error": "Header must be formatted as: 'Client Product Group, Category, Subcategory, Shortcut'"}

            # Ignore first line which is the column names header row
            if index > 0:
                saveRow = Categories()

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

                #Run error checking on row

                db.session.add(saveRow)

        db.session.commit()
