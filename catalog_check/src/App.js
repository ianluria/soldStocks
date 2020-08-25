import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState({ success: "", error: "" });
  const [catalogErrors, setCatalogErrors] = useState();
  const [thisTLD, setThisTLD] = useState();
  const [thisFileName, setThisFileName] = useState();
  const [loading, setLoading] = useState("");

  // Check if there is a catalog loaded in database
  // If there is, load error status into state
  useEffect(() => {
    setLoading("Checking for loaded catalog.")
    fetch('/checkForLoadedCatalog')
      .then(response => response.json())
      .then(data => {
        if (data.loaded) {
          setThisTLD(data.thisTLD)
          setThisFileName(data.thisFileName)
          generateErrorOverview(setCatalogErrors)
        } else {
          setStatus({ success: "", error: "Load a catalog to get started." })
        }
        setLoading(false)
      });
  }, []);

  return (
    <Container fluid>
      <Row className="my-3">
        <Container fluid>
          <Navbar bg="dark" variant="dark" fluid>
            <Navbar.Brand href="#home" className="mr-3">Catalog Checker</Navbar.Brand>
            <Nav className="justify-content-between w-100">
              <Nav.Item>
                <span className="text-light">TLD:&nbsp;&nbsp;<span className="text-monospace">{thisTLD}</span></span>
              </Nav.Item>
              <Nav.Item>
                <span className="text-light">CSV loaded: "<span className="text-monospace">{thisFileName}</span>"</span>
              </Nav.Item>
            </Nav>
          </Navbar>
        </Container>
      </Row>
      <Row>
        {!loading &&
          <Container fluid>
            <Row className="my-3">
              <Container fluid>
                <Row className="justify-content-center">
                  {status.success &&
                    <Alert variant="success">
                      {status.success}
                    </Alert>
                  }
                  {status.error &&
                    <Alert variant="danger">
                      {status.error}
                    </Alert>
                  }
                </Row>
                <Row className="justify-content-around">
                  <Button variant="outline-dark" onClick={handleLoadCSVButtonClick}>
                    Load CSV File
                  </Button>
                  {/* If there are catalogErrors, a catalog has been loaded */}
                  {catalogErrors &&
                    <React.Fragment>
                      <Button variant="outline-dark" onClick={handleErrorCountsButtonClick}>
                        Error Counts
                      </Button>
                      <Button Button variant="outline-dark" onClick={downloadCSV}>
                        Download CSV
                      </Button>
                    </React.Fragment>
                  }
                </Row>
              </Container>
            </Row>
            <Row className="my-3">
              <Container fluid>
                {display}
              </Container>
            </Row>
          </Container>
        }
        {loading &&
          <Container fluid>
            <Row className="justify-content-center my-3">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </Row>
            <Row className="justify-content-center">
              <p>{loading}</p>
            </Row>
          </Container>
        }
      </Row>
    </Container >
  );

  function downloadCSV(event) {
    // Clear status
    setStatus({ success: "", error: "" })

    setLoading("Downloading CSV File.")

    fetch('/downloadCSV')
      .then(response => response.json())
      .then(data => {
        setStatus(data.status)
        setLoading("")
      });
  }

  function handleLoadCSVButtonClick(event) {
    setDisplay(
      <LoadCSVFile
        setCatalogErrors={setCatalogErrors}
        setDisplay={setDisplay}
        setStatus={setStatus}
        setThisTLD={setThisTLD}
        setThisFileName={setThisFileName}
        setLoading={setLoading}
      />)
    // Clear status
    setStatus({ success: "", error: "" })
    return;
  }

  function handleErrorCountsButtonClick(event) {

    setDisplay(
      <DisplayCatalogErrors
        setDisplay={setDisplay}
        catalogErrors={catalogErrors}
        setCatalogErrors={setCatalogErrors}
      />)
    // Clear status
    setStatus({ success: "", error: "" })

    return;

  }

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
      const errorsToFix = Object.entries(fixErrors).filter(error => error[1] === true).map(trueError => trueError[0]);

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
            <FontAwesomeIcon icon={faAngleDown} className="rotateIcon ml-3" />
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
                  <span>No errors found.</span>
                }
              </ListGroup.Item>
            </div>
          </Collapse>
        </React.Fragment>;
    }
  }

  const listHTML =
    <Row className="justify-content-center">
      <Col sm={6}>
        <Button variant="outline-danger" onClick={handleErrorCorrectionSubmit}>Fix Errors</Button>
        <ListGroup className="mt-3">
          {errorsArray}
        </ListGroup>
      </Col>
    </Row>;

  return listHTML;
}

function LoadCSVFile(props) {
  const [thisLocalTLD, setThisLocalTLD] = useState();
  const fileInput = React.createRef();

  function handleSetupFormSubmit(e) {

    // set display to loading
    props.setLoading("Loading CSV File.")

    e.preventDefault();

    const formData = new FormData();
    formData.append("file", fileInput.current.files[0]);
    formData.append("tld", thisLocalTLD);

    const requestOptions = {
      method: 'PUT',
      body: formData
    };

    fetch('/loadCSV', requestOptions)
      .then(response => response.json())
      .then(data => {
        const updatedStatus = { success: "", error: "" };
        if (data.status.success) {
          updatedStatus.success = data.status.success;
        } else if (data.status.error) {
          updatedStatus.error = data.status.error;
        }
        props.setStatus(updatedStatus)
        props.setThisFileName(data.fileName)
        generateErrorOverview(props.setCatalogErrors)
        props.setLoading(false)
        props.setDisplay("")
      });
  }

  function selectChange(event) {
    props.setThisTLD(event.target.value)
    setThisLocalTLD(event.target.value)
    return;
  }

  return (
    <Row className="my-3">
      <Container as="form" onSubmit={handleSetupFormSubmit}>
        <Row className="justify-content-center">
          <Col sm={4} >
            <Form.Group controlId="formGroupFile">
              <Form.File
                id="usersCSVFile"
                label="Upload CSV File"
                ref={fileInput}
                custom
              />
            </Form.Group>
          </Col>
          <Col sm={3} >
            <Form.Group controlId="formGroupSelect">
              <Form.Label>Select Catalog TLD</Form.Label>
              <Form.Control as="select" htmlSize={2} onChange={selectChange} custom>
                <option>US</option>
                <option>CA</option>
                <option>UK</option>
                <option>FR</option>
                <option>ES</option>
                <option>DE</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-center my-3">
          <Col sm={"auto"}>
            <Button variant="outline-primary" type="submit">Load CSV</Button>
          </Col>
        </Row>
      </Container>
    </Row>
  );
}

// Gets an accounting of errors from backend and adds it formatted to state
function generateErrorOverview(setCatalogErrors) {

  function addErrorsToState(errorsResponseData) {

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
  }

  fetch('/errorOverview')
    .then(errorsResponse => errorsResponse.json())
    .then(errorsResponseData => addErrorsToState(errorsResponseData));
}

export default App;
