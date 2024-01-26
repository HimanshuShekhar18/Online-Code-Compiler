import axios from "axios";
import "./App.css";
import { React, useState } from "react";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");

  const handleSubmit = async () => {
    console.log(code);
    console.log(language);
    const payload = { language, code };

    try
    {
      setJobId("");
      setStatus("");
      setOutput("");
      // post request to server
      const { data } = await axios.post("http://localhost:5501/run", payload);
      console.log(data);
      setJobId(data._id);

      let intervalId = setInterval( async () => {
        const {data: dataRes} = await axios.get("http://localhost:5501/status",{params: {id: data._id}});
        const {success, job, error } = dataRes;

        if(success){
            const {status: jobStatus, output: jobOutput} = job;
            setStatus(jobStatus);
            if(jobStatus==="pending") return;
            setOutput(jobOutput);
            clearInterval(intervalId);
        }
        else {
          setStatus("Error: Please retry!");
          console.error(error);
          clearInterval(intervalId);
          setOutput(error);
        }

        console.log(dataRes);
      },
      1000); // 1000 ms
    }
    catch (err)  // two types of error server error or code error
    {
      // console.log(err);
      const {response} = err;
      if(response){
        const errMsg = response.data.err.stderr;
        setOutput(errMsg);
      }
      else{
        setOutput("Error connecting to server");
        window.alert('Error connectiong to server');
      }
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
      <h1 style={{ color: "#fff", marginTop: "-50px" }}>
        Online Code Compiler
      </h1>
      <div
        style={{
          marginBottom: "10px",
          marginLeft: "-510px",
        }}
      >
        <label
          style={{
            fontSize: "30px",
          }}
        >
          Language:{" "}
        </label>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            console.log(e.target.value);
          }}
          style={{
            fontSize: "25px",
            border: "5px solid gray",
            borderRadius: "10px",
            marginLeft: "10px",
          }}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
          <option value="java">Java</option>
        </select>
      </div>
      <span
        style={{
          borderRadius: "10px",
          border: "5px solid red",
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
          marginBottom: "10px",
          fontSize: "30px",
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: "#0057FF",
          color: "#fff",
          transition: "all 0.3s ease-in-out",
        }}
      >
        RUN
      </button>
      <span
        style={{
          borderRadius: "10px",
          border: "5px solid red",
          overflow: "hidden",
        }}
      >
        <textarea rows="10" cols="100" value={output}></textarea>
      </span>
      <p>{status}</p>
      <p>{jobId && `JobID: ${jobId}`}</p>
      </div>
  );
}

export default App;

