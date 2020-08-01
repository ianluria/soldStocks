import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';

// import './App.css';

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState();
  const [open, setOpen] = useState();
  const [done, setDone] = useState(false);

  
  function whenDone(itsDone){

    if (itsDone){
      setDisplay(<p>It's done...</p>)
    }

  }  

  
  

  return (
    <div className="App">
      <header className="App-header">
        {status}
        {done.toString()}
        <button onClick={() => setDisplay(<LoadCSVFile />)}>Load CSV File</button>
        <button onClick={() => ErrorCounts(whenDone=whenDone)}>Error Counts</button>
      </header>
      <main className="container">
        {display}

      </main>

    </div>
  );
}





function ErrorCounts(whenDone) {

  const formattedErrorNames = {
    dateError: "Date Error", trackItemError: "Track Item Error", retailerError: "Retailer Error", retailerItemIDError: "Retailer Item ID Error", tldError: "TLD Error", upcError: "UPC Error", titleError: "Title Error",
    manufacturerError: "Manufacturer Error", brandError: "Brand Error", clientProductGroupError: "Client Product Group Error", categoryError: "Category Error", subCategoryError: "Subcategory Error", VATCodeError: "VAT Code Error"
  }

  // function handleListItemClick(e) {

  //   const updatedOpen = Object.assign({}, props.open);
  //   const thisError = e.target.id;
  //   updatedOpen[thisError] = !updatedOpen[thisError];
  //   props.setOpen(updatedOpen);
  //   console.log(props.open);
  // }

  // useEffect(() => {

    fetch('/errorOverview')
      .then(response => response.json())
      .then(data => {
        // console.log(data)
        const errorsArray = [];
        const tempOpen = {};

        for (let error in data) {
          // console.log(error);
          if (error !== "totalCount") {
            const thisKey = formattedErrorNames[error];
            errorsArray.push({ listKey: error, label: thisKey, count: data[error] });
            tempOpen[error] = false;
          }
        }
        console.log("tempopen", tempOpen);
        // props.setOpen(tempOpen);

        // errorsArray.sort((a, b) => b.count - a.count);

        // console.log("open", props.open);
        // for (let row in errorsArray) {

        //   const thisError = errorsArray[row].listKey;
        //   console.log("thiserror", props.open[thisError]);

        //   errorsArray[row] =
        //     <React.Fragment key={errorsArray[row].listKey}>
        //       <ListGroup.Item id={errorsArray[row].listKey} onClick={(e) => handleListItemClick(e)}>

        //         {errorsArray[row].label} : {errorsArray[row].count}
        //         <FontAwesomeIcon icon={faAngleDown} className="rotateIcon" />

        //       </ListGroup.Item>
        //       <Collapse in={props.open[thisError]}>
        //         <ListGroup.Item>
        //           This is where error fix information will be present.
        //         </ListGroup.Item>
        //       </Collapse>
        //     </React.Fragment>;
        // }

        // // Add total count to the very beginning
        // errorsArray.unshift(<li key="totalCount" className="list-group-item">{"Total rows"} : {data.totalCount} <FontAwesomeIcon icon={faAngleDown} /></li>)

        // const listHTML =
        //   <ListGroup>
        //     {errorsArray}
        //   </ListGroup>;


        whenDone(true)
        // props.setDisplay(listHTML)
      // });
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
