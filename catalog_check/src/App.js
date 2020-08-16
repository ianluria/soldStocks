import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';

// import './App.css';

// when app is starting, check if db is already holding a catalog
// style page

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState();
  const [catalogErrors, setCatalogErrors] = useState();
  const [thisTLD, setThisTLD] = useState();

  // Check if there is a catalog loaded in database
  // If there is, load error status into state
  useEffect(() => {
    fetch('/checkForLoadedCatalog')
      .then(response => response.json())
      .then(data => {
        if (data) {
          generateErrorOverview(setCatalogErrors, setDisplay)
        } else {
          setStatus("Load a catalog to get started.")
        }
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {status}
        <button onClick={() => setDisplay(<LoadCSVFile setCatalogErrors={setCatalogErrors} setDisplay={setDisplay} setStatus={setStatus} />)}>Load CSV File</button>
        {catalogErrors &&
          <button onClick={() => setDisplay(<DisplayCatalogErrors setDisplay={setDisplay} catalogErrors={catalogErrors} setCatalogErrors={setCatalogErrors} />)}>Error Counts</button>
        }

      </header>
      <main className="container">
        <div>{display}</div>
      </main>
    </div>
  );
}

function DisplayCatalogErrors(props) {

  // Used to track which collapse list items should be open
  const [open, setOpen] = useState({});
  // Used to track which error types the user wants fixed
  const [fixErrors, setFixErrors] = useState({});

  // combine handleListItemClick into one handler

  // Expand collapse list item when 'parent' list item is clicked
  function handleListItemClick(e) {
    const updatedOpenCollapse = Object.assign({}, open);
    if (updatedOpenCollapse.hasOwnProperty(e.currentTarget.id)) {
      updatedOpenCollapse[e.currentTarget.id] = !updatedOpenCollapse[e.currentTarget.id];
    } else {
      updatedOpenCollapse[e.currentTarget.id] = true;
    }
    setOpen(updatedOpenCollapse)
    return;
  }

  // Add or remove an error type to/from fixErrors on switch press
  function handleErrorSwitch(e) {
    const updatedFixErrors = Object.assign({}, fixErrors);
    if (updatedFixErrors.hasOwnProperty(e.currentTarget.id)) {
      updatedFixErrors[e.currentTarget.id] = !updatedFixErrors[e.currentTarget.id];
    } else {
      updatedFixErrors[e.currentTarget.id] = true;
    }
    setFixErrors(updatedFixErrors)
    return;
  }

  // Send list of errors to fix to backend
  function handleErrorCorrectionSubmit(e) {
    if (Object.keys(fixErrors).length !== 0) {

      // Array of the listKey names of all errors the user wants fixed.
      const errorsToFix = Object.entries(fixErrors).filter(error => error[1] == true).map(trueError => trueError[0]);


      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorsToFix)
      };

      // Check if there are any errors that need to be fixed with Keepa
      const keepaErrors = ["titleError", "brandError", "manufacturerError"];

      if (errorsToFix.some(error => keepaErrors.includes(error))) {

        fetch('/keepaErrorFix', requestOptions)
          .then(response => response.json())
          .then(data => {

          });
      }

      const generalErrors = ["dateError", "retailerError", "tldError", "upcError"];

      if (errorsToFix.some(error => generalErrors.includes(error))) {
        fetch('/generalErrorFix', requestOptions)
          .then(response => response.json())
          .then(data => {

          });
      }
    }
    // else add error status message for empty fixErrors
  }

  const errorMessages = {
    dateError: "Convert date to YYYY-MM-DD format.",
    titleError: "Get updated title from Keepa.",
    brandError: "Get updated brand from Keepa.",
    manufacturerError: "Get updated manufacturer from Keepa.",
    tldError: "Fill in blank TLD fields using the catalog's TLD.",
    retailerError: "Add Amazon as retailer.",
    upcError: "Truncate any characters above 255.",
  }

  // Copy the catalogErrors array  
  const errorsArray = props.catalogErrors.slice();

  for (let row in errorsArray) {
    // Total count does not need a drop down list item.
    if (errorsArray[row].listKey === 'totalCount') {
      errorsArray[row] =
        <React.Fragment key={errorsArray[row].listKey}>
          <ListGroup.Item id={errorsArray[row].listKey}>
            {errorsArray[row].label} : {errorsArray[row].count}
          </ListGroup.Item>
        </React.Fragment>;
    } else {
      errorsArray[row] =
        <React.Fragment key={errorsArray[row].listKey}>
          <ListGroup.Item id={errorsArray[row].listKey} onClick={handleListItemClick}>
            {errorsArray[row].label} : {errorsArray[row].count}
            <FontAwesomeIcon icon={faAngleDown} className="rotateIcon" />
          </ListGroup.Item>

          <Collapse id={errorsArray[row].listKey + "Collapse"} in={open[errorsArray[row].listKey]}>
            {/* Div added to smooth collapse transition */}
            <div>
              <ListGroup.Item>
                {/* Only display error correction switch if there were errors found */}
                {errorsArray[row].count > 0 &&
                  <Form>
                    <Form.Check
                      type="switch"
                      id={errorsArray[row].listKey + "Switch"}
                      label={errorMessages[errorsArray[row].listKey]}
                      onClick={handleErrorSwitch}
                    />
                  </Form>}
                {errorsArray[row].count === 0 &&
                  <p>No errors found.</p>}                  }
              </ListGroup.Item>
            </div>
          </Collapse>
        </React.Fragment>;
    }
  }

  const listHTML =
    <React.Fragment>
      <p onClick={handleErrorCorrectionSubmit}>Click to fix errors.</p>
      <ListGroup>
        {errorsArray}
      </ListGroup>;
    </React.Fragment>

  return listHTML;
}


function LoadCSVFile(props) {
  const fileInput = React.createRef();

  function handleSetupFormSubmit(e) {

    // set display to loading
    props.setDisplay("Loading")

    e.preventDefault();

    const formData = new FormData();
    formData.append("file", fileInput.current.files[0]);

    const requestOptions = {
      method: 'PUT',
      body: formData,
    };

    fetch('/loadCSV', requestOptions)
      .then(response => response.json())
      .then(data => {
        props.setStatus(data.status.success ? data.status.success : data.status.error)
        generateErrorOverview(props.setCatalogErrors, props.setDisplay)
      });
  }

  return (
    <div>
      <form onSubmit={handleSetupFormSubmit}>
        <label htmlFor="userfile">Upload file:</label>
        <input type="file" name="userfile" ref={fileInput} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

// Gets an accounting of errors from backend and adds it formatted to state
function generateErrorOverview(setCatalogErrors, setDisplay) {

  setDisplay("Loading")

  function addErrorsToState(errorsResponseData) {

    return new Promise((resolve, reject) => {

      const formattedErrorNames = {
        totalCount: "Total Count", dateError: "Date Error", trackItemError: "Track Item Error", retailerError: "Retailer Error", retailerItemIDError: "Retailer Item ID Error", tldError: "TLD Error", upcError: "UPC Error", titleError: "Title Error",
        manufacturerError: "Manufacturer Error", brandError: "Brand Error", clientProductGroupError: "Client Product Group Error", categoryError: "Category Error", subCategoryError: "Subcategory Error", VATCodeError: "VAT Code Error"
      }

      const errorsArray = [];

      for (let error in errorsResponseData) {
        errorsArray.push({ listKey: error, label: formattedErrorNames[error], count: errorsResponseData[error] });
      }

      errorsArray.sort((a, b) => b.count - a.count);

      // Move totalCount to the zero index
      const returnArray = errorsArray.filter(element => element.listKey !== "totalCount");
      returnArray.unshift(errorsArray.find(element => element.listKey === "totalCount"));

      setCatalogErrors(returnArray)

      resolve(true);
    });
  }

  fetch('/errorOverview')
    .then(errorsResponse => errorsResponse.json())
    .then(errorsResponseData => addErrorsToState(errorsResponseData))
    .then(success => {
      setDisplay("Finished")
    });
}

export default App;
