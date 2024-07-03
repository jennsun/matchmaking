import React, { useState } from "react";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [allPairs, setAllPairs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [mostCompatible, setMostCompatible] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        console.log("CSV Data:", result.data); // Debugging log
        setData(result.data);
        setFileUploaded(true);
      },
    });
  };

  const handleComputeMatches = () => {
    setProcessing(true);
    console.log("Data before computing matches:", data); // Debugging log
    const computedMatches = computeMatches(data);
    console.log("Computed Matches:", computedMatches); // Debugging log
    setAllPairs(computedMatches);
    const pairedMatches = getPairedMatches(computedMatches, true);
    console.log("Paired Matches:", pairedMatches); // Debugging log
    setMatches(pairedMatches);
    setProcessing(false);
  };

  const computeMatches = (data) => {
    let pairs = [];
    let males = data.filter((person) => person.gender === "M");
    let females = data.filter((person) => person.gender === "F");
    console.log("Males:", males); // Debugging log
    console.log("Females:", females); // Debugging log

    males.forEach((male) => {
      females.forEach((female) => {
        const score = calculateCompatibility(male, female);
        pairs.push({ male: male.name, female: female.name, score });
      });
    });

    pairs.sort((a, b) => b.score - a.score);
    return pairs;
  };

  const calculateCompatibility = (person1, person2) => {
    let score = 0;
    const keys = Object.keys(person1).filter((key) => key.startsWith("Q"));
    keys.forEach((key) => {
      score += 10 - Math.abs(person1[key] - person2[key]);
    });
    return score;
  };

  const getPairedMatches = (matches, isMostCompatible) => {
    let pairedMatches = [];
    let usedMales = new Set();
    let usedFemales = new Set();

    if (!isMostCompatible) {
      matches = [...matches].reverse();
    }

    matches.forEach((match) => {
      if (!usedMales.has(match.male) && !usedFemales.has(match.female)) {
        pairedMatches.push(match);
        usedMales.add(match.male);
        usedFemales.add(match.female);
      }
    });

    return pairedMatches;
  };

  const toggleCompatibility = () => {
    setMostCompatible(!mostCompatible);
    const pairedMatches = getPairedMatches(allPairs, !mostCompatible);
    setMatches(pairedMatches);
  };

  return (
    <div className="App">
      <h1>Matchmaking Bot</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {fileUploaded && (
        <button onClick={handleComputeMatches}>Compute Matches</button>
      )}
      <button onClick={toggleCompatibility}>
        {mostCompatible ? "Most Compatible" : "Least Compatible"}
      </button>
      <h2>List of Matches</h2>
      {processing ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {matches.map((match, index) => (
            <li key={index}>
              {match.male} & {match.female} - Score: {match.score}
            </li>
          ))}
        </ul>
      )}
      <CSVLink
        data={matches}
        headers={[
          { label: "Male", key: "male" },
          { label: "Female", key: "female" },
          { label: "Score", key: "score" },
        ]}
      >
        <button>Export CSV</button>
      </CSVLink>
    </div>
  );
};

export default App;
