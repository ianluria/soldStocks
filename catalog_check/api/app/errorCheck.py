
# import re


# # Check if the row has specific columns included
# def missingColumn(row=row, columns=columns):

#     checkRow = [columnName in row for columnName in columns]

#     return not True in checkRow


# def checkRowForErrors(row):

#     if not isinstance(row, Catalog):
#         return False

#     basicCharacterLengthCheck = ['trackItem', 'upc', 'manufacturer',
#                                  'brand', 'clientProductGroup', 'categorysubCategory']

#     missingValueCheck = ["tld", "retailer", "VATCode"]

#     for column in basicCharacterLengthCheck + missingValueCheck:
#         thisCell = getattr(row, column, None)
#         errorFound = False

#         if column in missingValueCheck and not thisCell:
#             errorFound = True

#         elif column in basicCharacterLengthCheck and thisCell and len(thisCell) > 200:
#             errorFound = True

#         if errorFound:
#             setattr(row, column + "Error", True)

#     if len(row.title) > 500:
#         row.titleError = True

#     if len(row.retailerItemID) != 10:
#         row.retailerItemIDError = True

#     # Date must be yyyy(-|/)mm(-|/)dd
#     if not re.match("([0-9]{4})[/-]([0-9]{2})[/-]([0-9]{2})$", row.date):
#         row.dateError = True

#     return True


# def fixCharacterErrors(listOfCatalogRows):

#     errorFixCount = 0

#     for row in listOfCatalogRows:

#        # Keepa call

#         return errorFixCount


# def fixGeneralErrorsInRow(listOfCatalogRows):

#     errorFixCount = 0

#     dateFormat1 = re.compile("[-/]")
#     dateFormat2 = re.compile(
#         "^\d{2}[-/]\d{2}[-/]\d{2}$|^\d{2}[-/]\d{2}[-/]\d{4}$")
#     dateFormat3 = re.compile("^\d{4}[-/]\d{2}[-/]\d{2}$")
#     dateFormat4 = re.compile("^\d+$")

#     for row in listOfCatalogRows:

#         # Fix date error
#         if row.dateError:
#             # Test if date string has '-' or '/'
#             if dateFormat1.search(row.date):
#                 # MM-DD-YY or MM-DD-YYYY
#                 if dateFormat2.match(row.date):
#                     thisDate = date(
#                         row.date[6:], row.date[0:2], row.date[3:5])
#                 # YYYY-MM-DD
#                 elif dateFormat3.match(row.date):
#                     thisDate = date(
#                         row.date[0:4], row.date[5:7], row.date[8:10])
#             # Test if MS serialized date format
#             elif dateFormat4.match(row.date):
#                 thisDate = from_excel_ordinal(row.date)

#                 # From: https://stackoverflow.com/questions/29387137/how-to-convert-a-given-ordinal-number-from-excel-to-a-date
#                 def from_excel_ordinal(ordinal, _epoch0=datetime(1899, 12, 31)):
#                     if ordinal >= 60:
#                         ordinal -= 1  # Excel leap year bug, 1900 is not a leap year!
#                     return (_epoch0 + timedelta(days=ordinal)).replace(microsecond=0)

#             row.date = thisDate.__str__()
#             errorFixCount += 1

#         # Fix retailer error
#         if row.retailerError:
#             if row.retailer.lower() != 'amazon':
#                 row.retailer = 'Amazon'
#                 errorFixCount += 1

#         # Fix TLD error
#         if row.TLDError:
#             if row.tld != thisTLD:
#                 row.retailer = thisTLD
#                 errorFixCount += 1

#         # Fix upcError
#         if row.UPCError:
#             # Return only the first 255 characters
#             row.upc = row.upc[0:256]
#             errorFixCount += 1

#         db.session.add(row)

#     return errorFixCount
