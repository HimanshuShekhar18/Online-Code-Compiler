import axios from "axios";
import "./App.css";
import { React, useState, useEffect } from "react";
import stubs from "./defaultStubs";
import moment from "moment";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setjobDetails] = useState(null);

  useEffect(() => {
    setCode(stubs[language]);
    setOutput("");
    setjobDetails(null);
    setJobId("");
    setStatus("");
  },[language]);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  const setDefaultLanguage = () => {
      localStorage.setItem("default-language", language);
      console.log(`${language} set as your default language`);
  };

  const renderTimeDetails = () => {
      if(!jobDetails){
        return "";
      }
      let result = "";
      let {submittedAt, startedAt, completedAt} = jobDetails;
      console.log(moment(submittedAt));
      const submit = moment(submittedAt).toString();
      result+=`Submitted At: ${submit}   `;
      if(!completedAt || !startedAt) return result;
      const start = moment(startedAt);
      console.log(start);
      const end = moment(completedAt);
      console.log(end);
      const executionTime = end.diff(start,'seconds', true);
      result+=`Execution Time: ${executionTime}s`;
      return result;
  };

  const handleSubmit = async () => {
    console.log(code);
    console.log(language);
    const payload = { language, code };

    try {
      setJobId("");
      setStatus("");
      setOutput("");
      setjobDetails(null);
      // post request to server
      const { data } = await axios.post("http://localhost:5501/run", payload);
      console.log(data);
      if (data._id) {
        setJobId(data._id);
        console.log('hello');

        let intervalId = setInterval(async () => {
          const { data: dataRes } = await axios.get(
            "http://localhost:5501/status",
            { params: { id: data._id } }
          );
          const { success, job, error } = dataRes;

          console.log(dataRes);

          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            setjobDetails(job);
            if (jobStatus === "pending") return;
            setOutput(jobOutput);
            clearInterval(intervalId);
          } else {
            setStatus("Error: Please retry!");
            console.error(error);
            clearInterval(intervalId);
            setOutput(error);
          }

          console.log(dataRes);
        }, 1000); // 1000 ms
      }
      else{
        setOutput("Retry again");
      }
    } catch (err) { // two types of error server error or code error
      // console.log(err);
      const { response } = err;
      if (response) {
        const errMsg = response.data.err.stderr;
        setOutput(errMsg);
      } else {
        setOutput("Error connecting to server");
        window.alert("Error connectiong to server");
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
        marginTop: "90px",
      }}
    >
      <h1 style={{ color: "#fff", marginTop: "-70px" }}>
        Online Code Compiler
      </h1>
      <div
        style={{
          marginLeft: "-435px",
        }}
      >
        <label
          style={{
            fontSize: "30px",
            fontFamily: 'Roboto Slab',
          }}
        >
          Language:{" "}
        </label>
        <select
          value={language}
          onChange={(e) => {
            // for making responsive user-interface
            // asking permission from user while changing language
            let response = window.confirm("WARNING: Switching the language, will remove your current code. Do you wish to proceed?");
            if(response) setLanguage(e.target.value);
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
      <br/>


      <div style={{
          marginBottom: "10px",
          marginLeft: "-610px",
          fontSize: "30px",
          fontFamily: 'Roboto Slab',
        }}>
        <button  onClick={setDefaultLanguage}>Set Default</button>
      </div>


      <span
        style={{
          borderRadius: "10px",
          border: "5px solid red",
          overflow: "hidden",
        }}
      >
        <textarea
          rows="27"
          cols="90"
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
          fontSize: "25px",
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
        <textarea rows="10" cols="90" value={output}></textarea>
      </span>
      <p style={{marginBottom: "-5px"}}>{status}</p>
      <p>{jobId && `JobID: ${jobId}`}</p>
      <p>{renderTimeDetails()}</p>
    </div>
  );
}

export default App;
