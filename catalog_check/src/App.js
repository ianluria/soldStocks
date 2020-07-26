import React, { useState } from 'react';

// import './App.css';

function App() {

  const [display, setDisplay] = useState();
  const [status, setStatus] = useState();


  return (
    <div className="App">
      <header className="App-header">
        {status}
        <button onClick={() => setDisplay(<LoadCSVFile />)}>Load CSV File</button>
      </header>
      <main>
        {display}
      </main>
    </div>
  );
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
