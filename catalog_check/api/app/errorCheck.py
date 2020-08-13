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

        elif column in basicCharacterLengthCheck and thisCell and len(thisCell) > 200:
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


def fixErrorsInRow(dict):

    errorFixCount = 0
    row = dict[row]
    # Fix date error
    if row.dateError:
        # Test if date string has '-' or '/'
        if dict["dateFormat1"].search(row.date):
            # MM-DD-YY or MM-DD-YYYY
            if dict["dateFormat2"].match(row.date):
                thisDate = date(
                    row.date[6:], row.date[0:2], row.date[3:5])
            # YYYY-MM-DD
            elif dict["dateFormat3"].match(row.date):
                thisDate = date(
                    row.date[0:4], row.date[5:7], row.date[8:10])
        # Test if MS serialized date format
        elif dict["dateFormat4"].match(row.date):
            thisDate = from_excel_ordinal(row.date)

            # From: https://stackoverflow.com/questions/29387137/how-to-convert-a-given-ordinal-number-from-excel-to-a-date
            def from_excel_ordinal(ordinal, _epoch0=datetime(1899, 12, 31)):
                if ordinal >= 60:
                    ordinal -= 1  # Excel leap year bug, 1900 is not a leap year!
                return (_epoch0 + timedelta(days=ordinal)).replace(microsecond=0)

        row.date = thisDate.__str__()
        errorFixCount += 1

    characterErrors = ['titleError',
                       'manufacturerError', 'brandError']
    # for error in characterErrors:
    # replace with Keepa fill

    # if row[error]:
    #     if dict["goodCharacters"].search(row[error]):
    #         listOfGoodCharacters = dict["goodCharacters"].findall(
    #             row[error])
    #         row[error] = " ".join(listOfGoodCharacters)
    # errorFixCount += 1

    # Fix retailer error
    if row.retailer.lower() != 'amazon':
        row.retailer = 'Amazon'
        errorFixCount += 1

    # Fix TLD error
    if row.tld != dict["thisTLD"]:
        row.retailer = dict["thisTLD"]
        errorFixCount += 1

    return {"row": row, "errorFixCount": errorFixCount}
