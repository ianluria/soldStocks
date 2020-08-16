keepaCheckErrors = [("titleError", True),
                    ("manufacturerError", True), ("brandError", True)]

requestJSON = {"titleError": True, "manufacturerError": False,
               "brandError": True, "upcError": False, }

t = [item for item in requestJSON.items() if item[1]
     and item not in keepaCheckErrors]

print(not t)
