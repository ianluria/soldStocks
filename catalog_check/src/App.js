import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import "./App.css";

import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import { Dropdown } from 'react-bootstrap';

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState({ success: "", error: "" });
  const [loadedCSV, setLoadedCSV] = useState();
  const [thisFileName, setThisFileName] = useState();
  const [loading, setLoading] = useState("");

  // Check if there is a stock history loaded in database
  useEffect(() => {
    setLoading("Checking for loaded stock sale history.")
    fetch('/checkForLoadedSales')
      .then(response => response.json())
      .then(data => {
        if (data.loaded) {
          setThisFileName(data.thisFileName)
          setLoadedCSV(true)
        } else {
          setStatus({ success: "", error: "Load stock sales CSV to get started." })
        }
        setLoading(false)
      });
  }, []);

  return (
    <Container fluid>
      <Row className="mt-3">
        <Container fluid>
          <Navbar bg="dark" variant="dark" fluid>
            <Navbar.Brand href="#home" className="mr-3">Sold Stocks</Navbar.Brand>
            <Nav className="justify-content-end w-100">
              {loadedCSV &&
                <Nav.Item>
                  <span className="text-light">CSV loaded: "<span className="text-monospace">{thisFileName}</span>"</span>
                </Nav.Item>
              }
            </Nav>
          </Navbar>
        </Container>
      </Row>
      <Row className="mb-3">
        <Container fluid>
          <Navbar bg="dark" variant="dark" fluid >
            {!loading &&
              <Nav className="justify-content-around w-100">
                <Nav.Item>
                  <Button variant="outline-light" onClick={handleLoadCSVButtonClick} size="sm" className="mb-2">
                    Load CSV File
                  </Button>
                </Nav.Item>
                {loadedCSV &&
                  <React.Fragment>
                    <Nav.Item>
                      <Button variant="outline-light" onClick={handlePreformanceButtonClick} size="sm">
                        Calculate Preformance
                      </Button>
                    </Nav.Item>
                    <Nav.Item>
                      <Button Button variant="outline-light" onClick={downloadCSV} size="sm">
                        Download CSV
                      </Button>
                    </Nav.Item>
                  </React.Fragment>
                }
              </Nav>
            }
          </Navbar>
        </Container>
      </Row>
      <Row>
        {!loading &&
          <Container fluid>
            <Row className="my-3 justify-content-center">
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
            <Row className="my-3 justify-content-center">
              <Container fluid>
                {display}
              </Container>
            </Row>
          </Container>
        }
        {loading &&
          <Container fluid id="loading">
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
        setLoadedCSV={setLoadedCSV}
        setDisplay={setDisplay}
        setStatus={setStatus}
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
        setStatus={setStatus}
      />)
    // Clear status
    setStatus({ success: "", error: "" })

    return;

  }

}
// take api results and transform into an Array.  calculate the total return for each ticker symbol and display date break downs by Dropdown. for more than 10 transactions provide a new display element
function DisplayPreformance(props) {

  // Used to track which collapse list items should be open
  const [open, setOpen] = useState({});

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



  // get preformance data and save locally
  const stocksArray = []

  fetch('/generateSalesPerformance')
    .then(response => response.json())
    .then(data => { });






  for (let row in stocksArray) {

    stocksArray[row] =
      <React.Fragment key={stocksArray[row].listKey}>
        <ListGroup.Item id={stocksArray[row].listKey} onClick={handleListItemClick}>
          {stocksArray[row].label} : {stocksArray[row].performance}
          <FontAwesomeIcon icon={faAngleDown} className="rotateIcon ml-3" />
        </ListGroup.Item>

        <Collapse id={stocksArray[row].listKey + "Collapse"} in={open[stocksArray[row].listKey]}>
          {/* Div added to smooth collapse transition */}
          <div>
            <ListGroup.Item>
              {/* Only display error correction switch if there were errors found */}

            </ListGroup.Item>
          </div>
        </Collapse>
      </React.Fragment>;
  }

  const listHTML =
    <Row className="justify-content-center">
      <Col sm={6}>
        <ListGroup className="mt-3">
          {stocksArray}
        </ListGroup>
      </Col>
    </Row>;

  return listHTML;
}


function LoadCSVFile(props) {

  const [thisFileName, setThisFileName] = useState("Upload CSV File");
  const fileInput = React.createRef();

  function handleSetupFormSubmit(e) {

    // set display to loading
    props.setLoading("Loading CSV File.")

    e.preventDefault();

    const formData = new FormData();
    formData.append("file", fileInput.current.files[0]);

    const requestOptions = {
      method: 'PUT',
      body: formData
    };

    fetch('/loadCSV', requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const updatedStatus = { success: "", error: "" };
        if (data.status.success) {
          updatedStatus.success = data.status.success;
          props.setLoadedCSV(true)
          props.setThisFileName(data.fileName)
          props.setDisplay(<DisplayUploadErrors problemsWithData={data.errors} />)
        } else if (data.status.error) {
          updatedStatus.error = data.status.error;
          props.setLoadedCSV(false)
          props.setDisplay("")
        }
        props.setStatus(updatedStatus)
        props.setLoading(false)

      });
  }

  function formFilechangeHandler(e) {
    setThisFileName(fileInput.current.files[0].name)
  }

  return (
    <Row className="my-3">
      <Container as="form" onSubmit={handleSetupFormSubmit}>
        <Row className="justify-content-center">
          <Col>
            <Form.Group controlId="formGroupFile">
              <Form.File
                id="usersCSVFile"
                label={thisFileName}
                ref={fileInput}
                onChange={formFilechangeHandler}
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

// Need to display default setting if there are not errors in data
function DisplayUploadErrors(props) {

  if (props.problemsWithData.length === 0) {
    return null;
  }

  // Takes raw date string directly from API and returns a formatted string version  
  function getDateString(dateStringFromAPI) {
    const dateObject = new Date(dateStringFromAPI);
    if (dateObject.toDateString() === "Invalid Date") {
      return "";
    }
    return dateObject.toDateString().slice(4);
  }

  function colorMissingDataCell(data) {

    if (!data) {
      return <td className="missingDataRed"> </td>
    } else {
      return <td>{data}</td>
    }
  }

  const formattedErrorsArray = [];

  for (let error in props.problemsWithData) {
    error = props.problemsWithData[error]
    formattedErrorsArray.push(
      <tr>
        <td>{error.index}</td>
        {colorMissingDataCell(error.row.ticker)}
        {colorMissingDataCell(getDateString(error.row.date))}
        {colorMissingDataCell(error.row.shares)}
        <td>{error.row.price}</td>
      </tr>
    )
  }

  return (
    <Row className="my-3">
      <Container>
        <p className="h4 text-center">Errors Found In Your Upload</p>
        <p className="text-center">These rows were not added to your database. Please correct and re-upload CSV.</p>
        <Table bordered striped hover size="sm">
          <thead>
            <tr>
              <th>CSV Row #</th>
              <th>Ticker</th>
              <th>Date</th>
              <th>Shares</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {formattedErrorsArray}
          </tbody>
        </Table>
      </Container>
    </Row>
  );
}


export default App;
