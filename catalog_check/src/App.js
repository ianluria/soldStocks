import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';

// import './App.css';

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState();
  const [catalogErrors, setCatalogErrors] = useState();



  return (
    <div className="App">
      <header className="App-header">
        {status}
        <button onClick={() => setDisplay(<LoadCSVFile setCatalogErrors={setCatalogErrors} setDisplay={setDisplay} setStatus={setStatus} />)}>Load CSV File</button>
        {/* <button onClick={() => setDisplay(<DisplayCatalogErrors setDisplay={setDisplay} />)}>Error Counts</button> */}
      </header>
      <main className="container">
        <p>{display}</p>
      </main>
    </div>
  );


  // function handleListItemClick(e) {

  //   console.log("CLICK IN", openCollapses[e.currentTarget.id]);
  //   const updatedOpenCollapse = Object.assign({}, openCollapses);
  //   const thisError = e.currentTarget.id;
  //   updatedOpenCollapse[thisError] = !updatedOpenCollapse[thisError];
  //   setOpenCollapses(updatedOpenCollapse);
  //   console.log("CLICK OUT", openCollapses[e.currentTarget.id]);
  // }


  // }

  // function errorCounts(setDisplay) {

  //   let hello = async () => { return "Hello" };
  //   hello().then((value) => setDisplay(value));


}

// function DisplayCatalogErrors(props) {

//   const [loaded, setLoaded] = useState(false);



//   // useEffect(() => {
//   //   console.log("use effect");


//   // props.setOpenCollapses({...openStatusObject})
//   console.log("open collapses: ", Object.keys(props.openCollapses).length === 0);
//   if (Object.keys(props.openCollapses).length === 0) {
//     props.setOpenCollapses(openStatusObject);
//   }

//   errorsArray.sort((a, b) => b.count - a.count);

//   for (let row in errorsArray) {

//     errorsArray[row] =
//       <React.Fragment key={errorsArray[row].listKey}>
//         <ListGroup.Item id={errorsArray[row].listKey} onClick={props.handleListItemClick}>

//           {errorsArray[row].label} : {errorsArray[row].count}
//           <FontAwesomeIcon icon={faAngleDown} className="rotateIcon" />

//         </ListGroup.Item>
//         <Collapse in={props.openCollapses[errorsArray[row].listKey]}>
//           {/* <Collapse in={false}> */}
//           <ListGroup.Item>
//             This is where error fix information will be present.
//               </ListGroup.Item>
//         </Collapse>
//       </React.Fragment>;
//   }

//   // Add total count to the very beginning
//   errorsArray.unshift(<li key="totalCount" className="list-group-item">{"Total rows"} : {data.totalCount} <FontAwesomeIcon icon={faAngleDown} /></li>)

//   const listHTML =
//     <ListGroup>
//       {errorsArray}
//     </ListGroup>;

//   setLoaded("true")
//   props.setDisplay(listHTML)

// });
// // }, []);


// console.log(loaded);
// return "false";
// }


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
              errorsArray.push({ listKey: error, label: formattedErrorNames[error], count: errorsResponseData[error] });
            }

            props.setCatalogErrors(errorsArray)

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
