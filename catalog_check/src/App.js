import React, { useState, useEffect } from 'react';

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
      <main>
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
            errorsArray.push({ label: thisKey, count: data[error] });
          }
        }

        errorsArray.sort((a, b) => b.count - a.count);

        for (let row in errorsArray) {
          errorsArray[row] = <p>{errorsArray[row].label} : {errorsArray[row].count}</p>
        }

        // Add total count to the very beginning
        errorsArray.unshift(<p>{"Total rows"} : {data.totalCount}</p>)

        props.setDisplay(errorsArray)
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
