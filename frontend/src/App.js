import axios from "axios";
import "./App.css";
import { React, useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const handleSubmit = async () => {
    console.log(code);
    const payload = { language: "cpp", code };

    try{
    // post request to server
    const {data} = await axios.post("http://localhost:5501/run", payload);
    console.log(data);
    setOutput(data.output);
    }
    catch(err){
      console.log(err);
      window.alert('Syntax Error!!')
    }
    
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "100px",
      }}
    >
      <h1 style={{ color: "#fff" , marginTop: '-50px'}}>Online Code Compiler</h1>
      <select style={{ marginLeft: "-750px", marginBottom: "30px" }}>
        select
      </select>
      <span
        style={{
          borderRadius: "10px",
          border: "5px solid black",
          overflow: "hidden",
        }}
      >
        <textarea
          rows="30"
          cols="100"
          fontSize=""
          value={code}
          onChange={(e) => setCode(e.target.value)}
        ></textarea>
      </span>
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          marginBottom: '10px',
          fontSize: "30px",
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: "#0057FF",
          color: "#fff",
          transition: "all 0.3s ease-in-out",
        }}
      >
        Submit
      </button>
      <textarea
          rows="10"
          cols="50"
          value={output}
        ></textarea>
    </div>
  );
}

export default App;
