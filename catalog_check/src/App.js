import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
// import './App.css';

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState();


  return (
    <div className="App">
      <header className="App-header">
        {status}
        <button onClick={() => setDisplay(<LoadCSVFile />)}>Load CSV File</button>
        <button onClick={() => setDisplay(<ErrorCounts setStatus={setStatus} setDisplay={setDisplay} />)}>Error Counts</button>
      </header>
      <main className="container">
        {display}
      </main>
    </div>
  );
}




function ErrorCounts(props) {

  const formattedErrorNames = {
    dateError: "Date Error", trackItemError: "Track Item Error", retailerError: "Retailer Error", retailerItemIDError: "Retailer Item ID Error", tldError: "TLD Error", upcError: "UPC Error", titleError: "Title Error",
    manufacturerError: "Manufacturer Error", brandError: "Brand Error", clientProductGroupError: "Client Product Group Error", categoryError: "Category Error", subCategoryError: "Subcategory Error", VATCodeError: "VAT Code Error"
  }

  function listItemClick(e) {

    console.log(e);

  }

  useEffect(() => {
    fetch('/errorOverview')
      .then(response => response.json())
      .then(data => {
        // console.log(data)
        const errorsArray = [];

        for (let error in data) {
          // console.log(error);
          if (error !== "totalCount") {
            const thisKey = formattedErrorNames[error];
            errorsArray.push({ listKey: error, label: thisKey, count: data[error] });
          }
        }

        errorsArray.sort((a, b) => b.count - a.count);

        for (let row in errorsArray) {
          errorsArray[row] =
            <React.Fragment key={errorsArray[row].listKey}>
              <li className="list-group-item" onClick={listItemClick}>
                {errorsArray[row].label} : {errorsArray[row].count}
                <a data-toggle="collapse" href={"#" + errorsArray[row].listKey + "Dropdown"}>
                  <FontAwesomeIcon icon={faAngleDown} className="rotateIcon" />
                </a>
              </li>
              <li className="show" id={errorsArray[row].listKey + "Dropdown"}>
                This is where error fix information will be present.
              </li>
            </React.Fragment>
        }

        // Add total count to the very beginning
        errorsArray.unshift(<li key="totalCount" className="list-group-item">{"Total rows"} : {data.totalCount} <FontAwesomeIcon icon={faAngleDown} /></li>)

        const listHTML = <ul className="list group">
          {errorsArray}
        </ul>

        props.setDisplay(listHTML)
      });
  });

  return "Loading";
}

function LoadCSVFile(props) {
  const fileInput = React.createRef();

  function handleSetupFormSubmit(e) {

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
