import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faFireExtinguisher } from '@fortawesome/free-solid-svg-icons'

import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';

// import './App.css';

// when app is starting, check if db is already holding a catalog
// add error fix information for each error type
// back end error fixing
// style page





function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState();
  const [catalogErrors, setCatalogErrors] = useState();



  return (
    <div className="App">
      <header className="App-header">
        {status}
        <button onClick={() => setDisplay(<LoadCSVFile setCatalogErrors={setCatalogErrors} setDisplay={setDisplay} setStatus={setStatus} />)}>Load CSV File</button>
        <button onClick={() => setDisplay(<DisplayCatalogErrors setDisplay={setDisplay} catalogErrors={catalogErrors} setCatalogErrors={setCatalogErrors} />)}>Error Counts</button>
        {catalogErrors && <p>date error: {catalogErrors[0].openCollapse.toString()}</p>}
      </header>
      <main className="container">
        <p>{display}</p>
      </main>
    </div>
  );
}

function DisplayCatalogErrors(props) {

  const [open, setOpen] = useState({});
  const [fixErrors, setFixErrors] = useState({});

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

  // Add or remove the error type to/from object of error fixes on switch press
  function handleCollapseSwitch(e) {
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

    if (fixErrors) {

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fixErrors)
      };

      fetch('/errorFix', requestOptions)
        .then(response => response.json())
        .then(data => {

        });
    }
  }

  const errorMessages = {
    dateError: "Convert date to YYYY-MM-DD format.",
    titleError: "Get updated title from Keepa.",
    brandError: "Get updated brand from Keepa.",
    manufacturerError: "Get updated manufacturer from Keepa.",
    tldError: "Fill in blank TLD fields using the catalog's TLD.",
    retailerError: "Add Amazon add retailer."
  }

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
            <div>
              <ListGroup.Item>
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  label="Check this switch"
                  onClick={handleCollapseSwitch}
                />
                {errorMessages[errorsArray[row].listKey]}
              </ListGroup.Item>
            </div>
          </Collapse>
        </React.Fragment>;
    }
  }

  const listHTML =
    <ListGroup>
      {errorsArray}
    </ListGroup>;

  // setOpen(trackOpenDropdowns)
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

        fetch('/errorOverview')
          .then(errorsResponse => errorsResponse.json())
          .then(errorsResponseData => {

            const formattedErrorNames = {
              totalCount: "Total Count", dateError: "Date Error", trackItemError: "Track Item Error", retailerError: "Retailer Error", retailerItemIDError: "Retailer Item ID Error", tldError: "TLD Error", upcError: "UPC Error", titleError: "Title Error",
              manufacturerError: "Manufacturer Error", brandError: "Brand Error", clientProductGroupError: "Client Product Group Error", categoryError: "Category Error", subCategoryError: "Subcategory Error", VATCodeError: "VAT Code Error"
            }

            const errorsArray = [];

            for (let error in errorsResponseData) {
              errorsArray.push({ listKey: error, label: formattedErrorNames[error], count: errorsResponseData[error], openCollapse: false });
            }

            errorsArray.sort((a, b) => b.count - a.count);

            // Move totalCount to the zero index
            const returnArray = errorsArray.filter(element => element.listKey !== "totalCount");
            returnArray.unshift(errorsArray.find(element => element.listKey === "totalCount"));

            props.setCatalogErrors(returnArray)

            // return display to home
            props.setDisplay("Finished")
          });
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

export default App;
