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
            <Navbar.Brand href="#home" className="mr-3">Sold Stocks</Navbar.Brand>
            <Nav className="justify-content-between w-100">
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
                      <Button variant="outline-dark" onClick={handlePreformanceButtonClick}>
                        Calculate Preformance
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

  function handlePreformanceButtonClick(event) {

    setDisplay(
      <DisplayPreformance
        setDisplay={setDisplay}
        catalogErrors={catalogErrors}
        setCatalogErrors={setCatalogErrors}
        setStatus={setStatus}
      />)
    // Clear status
    setStatus({ success: "", error: "" })

    return;

  }

}

function DisplayPreformance(props) {

  // Used to track which collapse list items should be open
  const [open, setOpen] = useState({});


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




  // Copy the catalogErrors array
  const stocksArray = props.catalogErrors.slice();

  for (let row in stocksArray) {
    // Total count does not need a drop down list item.
    if (stocksArray[row].listKey === 'totalCount') {
      stocksArray[row] =
        <React.Fragment key={stocksArray[row].listKey}>
          <ListGroup.Item id={stocksArray[row].listKey}>
            {stocksArray[row].label} : {stocksArray[row].count}
          </ListGroup.Item>
        </React.Fragment>;
    } else {
      stocksArray[row] =
        <React.Fragment key={stocksArray[row].listKey}>
          <ListGroup.Item id={stocksArray[row].listKey} onClick={handleListItemClick}>
            {stocksArray[row].label} : {stocksArray[row].count}
            <FontAwesomeIcon icon={faAngleDown} className="rotateIcon ml-3" />
          </ListGroup.Item>

          <Collapse id={stocksArray[row].listKey + "Collapse"} in={open[stocksArray[row].listKey]}>
            {/* Div added to smooth collapse transition */}
            <div>
              <ListGroup.Item>
                {/* Only display error correction switch if there were errors found */}
                {stocksArray[row].count > 0 &&
                  <Form>
                    <Form.Check
                      type="switch"
                      id={stocksArray[row].listKey + "Switch"}
                      label={errorMessages[stocksArray[row].listKey]}
                      onClick={handleErrorSwitch}
                    />
                  </Form>}
                {stocksArray[row].count === 0 &&
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
        {/* <Button variant="outline-danger" onClick={handleErrorCorrectionSubmit}>Fix Errors</Button> */}
        <ListGroup className="mt-3">
          {stocksArray}
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

export default App;
