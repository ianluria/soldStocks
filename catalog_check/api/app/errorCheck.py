from app.models import Catalog
import re


def checkRowForErrors(row):

    if not isinstance(row, Catalog):
        return False

    basicCharacterLengthCheck = ['trackItem', 'upc', 'manufacturer',
                                 'brand', 'clientProductGroup', 'categorysubCategory']

    missingValueCheck = ["tld", "retailer", "VATCode"]

    for column in basicCharacterLengthCheck + missingValueCheck:
        thisCell = getattr(row, column, None)
        errorFound = False

        if column in missingValueCheck and not thisCell:
            errorFound = True

        elif column in basicCharacterLengthCheck and thisCell and len(thisCell > 200):
            errorFound = True

        if errorFound:
            setattr(row, column + "Error", True)

    if len(row.title) > 500:
        row.titleError = True

    if len(row.retailerItemID) != 10:
        row.retailerItemIDError = True

    # Date must be yyyy(-|/)mm(-|/)dd
    if not re.match("([0-9]{4})[/-]([0-9]{2})[/-]([0-9]{2})$", row.date):
        row.dateError = True

    return True
