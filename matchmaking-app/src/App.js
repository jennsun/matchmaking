import React, { useState } from "react";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import "./App.css";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

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
      <div className="accordion-container">
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="step1-content"
            id="step1-header"
          >
            Step 1: Create CSV from Responses
          </AccordionSummary>
          <AccordionDetails>
            <p>
              First, generate a .csv file from your matchmaking questionnaires' responses! To do so, you need to create a matchmaking questionnaire and send it out to your participants and collect responses. I recommend Typeform or for a free alternative, try <a href="https://youform.com/" target="_blank" rel="noopener noreferrer">YouForm</a>. Use questions where the more similar the score, the more compatible. Structure your csv where the first column is 'name', the second column is 'gender', and the following are the questions and answers. For an example, see <a href="https://docs.google.com/spreadsheets/d/1Qv-VwhdY_lPKJ1B2PqeLjrsFBY6_TsQw3pVnqv5OsMw/edit?usp=sharing" target="_blank" rel="noopener noreferrer">this</a>.
            </p>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="step3-content"
            id="step3-header"
          >
            Step 2: Upload CSV and Generate Matches!
          </AccordionSummary>
          <AccordionDetails>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            {fileUploaded && (
              <button onClick={handleComputeMatches}>Compute Matches</button>
            )}
            <button onClick={toggleCompatibility}>
              {mostCompatible ? "Most Compatible" : "Least Compatible"}
            </button>
            {processing ? (
              <p>Loading...</p>
            ) : (
              <>
                <h2>Matches:</h2>
                <ul>
                  {matches.map((match, index) => (
                    <li key={index}>
                      {match.male} & {match.female} - Score: {match.score}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <CSVLink
              data={matches}
              headers={[
                { label: "Male", key: "male" },
                { label: "Female", key: "female" },
                { label: "Score", key: "score" },
              ]}
              filename="matches.csv"
            >
              <button>Export CSV</button>
            </CSVLink>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default App;
