import React, { useState } from "react";
import "./SymptomsChecker.css"; // use your same CSS


const questionsData = {
  Q1: {
    text: "What symptom are you experiencing?",
    options: [
      { text: "Fever", next: "fever" },
      { text: "Cough", next: "cough" },
      { text: "Headache", next: "headache" },
      { text: "Stomach pain / Abdominal discomfort", next: "stomach_pain" },
      { text: "Sore throat", next: "sore_throat" },
      { text: "Runny or blocked nose", next: "runny_nose" },
      { text: "Fatigue / Tiredness", next: "fatigue" },
      { text: "Nausea or vomiting", next: "nausea_vomiting" },
      { text: "Diarrhea", next: "diarrhea" },
      { text: "Skin problems (rash, itching, swelling)", next: "skin_problems" },
    ],
  },

  // ==============================
  // Fever
  // ==============================
  fever: {
    text: "How high is your temperature?",
    options: [
      { text: "Mild (99–100.5°F)", next: "fever_duration" },
      { text: "Moderate (100.6–102°F)", next: "fever_duration" },
      { text: "High (102–104°F)", next: "fever_duration" },
      { text: "Very high (>104°F)", next: "fever_duration" },
    ],
  },
  fever_duration: {
    text: "How long has the fever lasted?",
    options: [
      { text: "<24 hours", next: "fever_associated" },
      { text: "2–3 days", next: "fever_associated" },
      {
        text: ">5 days",
        next: "output",
        output: "Persistent fever. Please consult a doctor.",
      },
    ],
  },
  fever_associated: {
    text: "Do you have any of the following with the fever?",
    options: [
      {
        text: "Rash",
        next: "output",
        output: "Fever with rash. Seek medical evaluation.",
      },
      {
        text: "Stiff neck",
        next: "output",
        output: "Could indicate meningitis. Urgent care needed.",
      },
      {
        text: "Breathing difficulty",
        next: "output",
        output: "Seek immediate medical attention.",
      },
      {
        text: "None",
        next: "output",
        output: "Likely viral. Rest and stay hydrated.",
      },
    ],
  },

  // ==============================
  // Cough
  // ==============================
  cough: {
    text: "Is your cough dry or productive?",
    options: [
      { text: "Dry", next: "cough_duration" },
      { text: "Productive", next: "cough_duration" },
    ],
  },
  cough_duration: {
    text: "How long have you had the cough?",
    options: [
      { text: "<2 weeks", next: "cough_associated" },
      { text: "2–3 weeks", next: "cough_associated" },
      {
        text: ">3 weeks",
        next: "output",
        output: "Chronic cough. Consult a doctor.",
      },
    ],
  },
  cough_associated: {
    text: "Are you experiencing any of these symptoms with the cough?",
    options: [
      {
        text: "Shortness of breath",
        next: "output",
        output: "Could indicate asthma or lung infection. Consult a doctor.",
      },
      {
        text: "Wheezing",
        next: "output",
        output: "May suggest airway narrowing. Seek evaluation.",
      },
      {
        text: "Chest tightness",
        next: "output",
        output: "Could indicate asthma or bronchitis.",
      },
      {
        text: "Blood in sputum",
        next: "output",
        output: "Serious condition. Seek urgent care.",
      },
      { text: "None", next: "output", output: "Likely viral. Monitor symptoms." },
    ],
  },

  // ==============================
  // Headache
  // ==============================
  headache: {
    text: "Where is the pain located?",
    options: [
      { text: "Front of head", next: "headache_severity" },
      { text: "One side", next: "headache_severity" },
      { text: "All over", next: "headache_severity" },
      { text: "Back of head", next: "headache_severity" },
    ],
  },
  headache_severity: {
    text: "What is the severity (1–10)?",
    options: [
      { text: "Mild (1–3)", next: "headache_associated" },
      { text: "Moderate (4–6)", next: "headache_associated" },
      {
        text: "Severe (7–10)",
        next: "output",
        output: "Severe headache. Seek medical evaluation.",
      },
    ],
  },
  headache_associated: {
    text: "Do you have associated symptoms?",
    options: [
      {
        text: "Nausea or vomiting",
        next: "output",
        output: "Could be migraine. Consult doctor if frequent.",
      },
      {
        text: "Sensitivity to light/sound",
        next: "output",
        output: "May indicate migraine.",
      },
      {
        text: "Visual disturbances",
        next: "output",
        output: "Seek immediate care. Possible neurological cause.",
      },
      {
        text: "Weakness or numbness",
        next: "output",
        output: "Possible stroke. Urgent care needed.",
      },
      {
        text: "None",
        next: "output",
        output: "Likely tension headache. Rest and hydrate.",
      },
    ],
  },

  // ==============================
  // Stomach Pain
  // ==============================
  stomach_pain: {
    text: "Where is the pain located?",
    options: [
      { text: "Upper right abdomen", next: "stomach_nature" },
      { text: "Upper middle abdomen", next: "stomach_nature" },
      { text: "Lower abdomen", next: "stomach_nature" },
      { text: "Generalized", next: "stomach_nature" },
    ],
  },
  stomach_nature: {
    text: "What is the nature of the pain?",
    options: [
      { text: "Sharp", next: "stomach_associated" },
      { text: "Cramping", next: "stomach_associated" },
      { text: "Burning", next: "stomach_associated" },
      { text: "Dull/aching", next: "stomach_associated" },
    ],
  },
  stomach_associated: {
    text: "Do you have associated symptoms?",
    options: [
      { text: "Diarrhea", next: "output", output: "May indicate infection." },
      { text: "Vomiting", next: "output", output: "Could be food poisoning." },
      {
        text: "Blood in stool",
        next: "output",
        output: "Urgent medical attention needed.",
      },
      { text: "Bloating", next: "output", output: "Likely indigestion." },
      {
        text: "Loss of appetite",
        next: "output",
        output: "May be stress or infection.",
      },
      { text: "None", next: "output", output: "Monitor symptoms." },
    ],
  },

  // ==============================
  // Sore Throat
  // ==============================
  sore_throat: {
    text: "Do you also have...?",
    options: [
      {
        text: "Fever",
        next: "output",
        output: "May indicate bacterial infection. Consult a doctor.",
      },
      {
        text: "Swollen tonsils with white patches",
        next: "output",
        output: "Possible strep throat. Medical check needed.",
      },
      { text: "Hoarseness of voice", next: "output", output: "Likely viral. Rest voice." },
      { text: "Difficulty swallowing", next: "output", output: "Consult doctor." },
      { text: "None", next: "sore_throat_duration" },
    ],
  },
  sore_throat_duration: {
    text: "How long has it lasted?",
    options: [
      { text: "<3 days", next: "output", output: "Likely viral infection. Rest and hydrate." },
      { text: "3–7 days", next: "output", output: "Could be bacterial. Monitor closely." },
      { text: ">1 week", next: "output", output: "Persistent sore throat. Consult doctor." },
    ],
  },

  // ==============================
  // Runny Nose
  // ==============================
  runny_nose: {
    text: "Is it accompanied by...?",
    options: [
      { text: "Sneezing", next: "output", output: "May indicate allergy." },
      { text: "Itchy eyes", next: "output", output: "Possible allergy." },
      { text: "Thick yellow/green mucus", next: "output", output: "Likely sinus infection." },
      { text: "Clear watery discharge", next: "output", output: "Common cold." },
    ],
  },

  // ==============================
  // Fatigue
  // ==============================
  fatigue: {
    text: "How long have you been experiencing fatigue?",
    options: [
      { text: "<1 week", next: "fatigue_sleep" },
      { text: "1–2 weeks", next: "fatigue_sleep" },
      { text: ">2 weeks", next: "output", output: "Persistent fatigue. Consult doctor." },
    ],
  },
  fatigue_sleep: {
    text: "How is your sleep quality?",
    options: [
      { text: "Poor", next: "output", output: "Likely due to poor sleep. Improve routine." },
      { text: "Interrupted", next: "output", output: "Could indicate stress. Try relaxation methods." },
      { text: "Normal", next: "fatigue_associated" },
    ],
  },
  fatigue_associated: {
    text: "Do you have associated symptoms?",
    options: [
      { text: "Weight loss", next: "output", output: "Possible chronic condition. Consult doctor." },
      { text: "Palpitations", next: "output", output: "Could indicate heart issues. Medical evaluation needed." },
      { text: "Shortness of breath", next: "output", output: "May suggest anemia or heart problem." },
      { text: "None", next: "output", output: "Mild fatigue. Rest and monitor." },
    ],
  },

  // ==============================
  // Nausea / Vomiting
  // ==============================
  nausea_vomiting: {
    text: "How often are you vomiting?",
    options: [
      { text: "Occasionally", next: "nausea_associated" },
      { text: "Frequently", next: "nausea_associated" },
      { text: "Unable to keep fluids down", next: "output", output: "Severe dehydration risk. Seek urgent care." },
    ],
  },
  nausea_associated: {
    text: "Do you also have...?",
    options: [
      { text: "Severe abdominal pain", next: "output", output: "Seek urgent medical care." },
      { text: "Blood in vomit", next: "output", output: "Serious condition. Seek immediate attention." },
      { text: "High fever", next: "output", output: "Could be infection. Consult doctor." },
      { text: "None", next: "output", output: "Likely mild stomach upset." },
    ],
  },

  // ==============================
  // Diarrhea
  // ==============================
  diarrhea: {
    text: "How long have you had diarrhea?",
    options: [
      { text: "<2 days", next: "diarrhea_frequency" },
      { text: "3–7 days", next: "diarrhea_frequency" },
      { text: ">7 days", next: "output", output: "Chronic diarrhea. Consult doctor." },
    ],
  },
  diarrhea_frequency: {
    text: "How frequent are your stools?",
    options: [
      { text: "Mild (2–3/day)", next: "diarrhea_associated" },
      { text: "Moderate (4–6/day)", next: "diarrhea_associated" },
      { text: "Severe (>6/day)", next: "output", output: "Severe diarrhea. Risk of dehydration." },
    ],
  },
  diarrhea_associated: {
    text: "Do you also have...?",
    options: [
      { text: "Signs of dehydration", next: "output", output: "Risk of severe dehydration. Seek care." },
      { text: "Blood/mucus in stool", next: "output", output: "Possible infection. Consult doctor." },
      { text: "Severe cramps", next: "output", output: "May indicate food poisoning." },
      { text: "None", next: "output", output: "Likely mild infection." },
    ],
  },

  // ==============================
  // Skin Problems
  // ==============================
  skin_problems: {
    text: "What type of skin problem do you have?",
    options: [
      { text: "Rash", next: "skin_spread" },
      { text: "Itching", next: "skin_spread" },
      { text: "Swelling", next: "skin_spread" },
      { text: "Blisters", next: "skin_spread" },
    ],
  },
  skin_spread: {
    text: "How is it spreading?",
    options: [
      { text: "Localized", next: "skin_associated" },
      { text: "Spreading slowly", next: "skin_associated" },
      { text: "Spreading rapidly", next: "output", output: "Rapid spreading rash. Seek urgent care." },
    ],
  },
  skin_associated: {
    text: "Do you also have...?",
    options: [
      { text: "Fever", next: "output", output: "Possible infection. Seek care." },
      { text: "Pain", next: "output", output: "May indicate infection or inflammation." },
      { text: "Breathing issues (possible allergy)", next: "output", output: "Severe allergic reaction. Emergency care needed." },
      { text: "None", next: "output", output: "Likely mild skin irritation." },
    ],
  },
};

// ====================================
// React Component
// ====================================
export default function SymptomChecker() {
  const [currentQuestion, setCurrentQuestion] = useState("Q1");
  const [history, setHistory] = useState([]);

  const handleOptionClick = (option) => {
    if (option.next === "output") {
      setHistory((prev) => [...prev, currentQuestion]);
      setCurrentQuestion({ result: option.output });
    } else {
      setHistory((prev) => [...prev, currentQuestion]);
      setCurrentQuestion(option.next);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentQuestion(prev);
    }
  };

  // Check if we're at an output screen
  if (typeof currentQuestion === "object" && currentQuestion.result) {
    return (
      <div className="card-container">
        <div className="quiz-card">
          <div className="back-button" onClick={handleBack}>←</div>
          <div className="question-title">Result</div>
          <div className="final-output">{currentQuestion.result}</div>
        </div>
      </div>
    );
  }

  const question = questionsData[currentQuestion];

  return (        
    <div className="card-container">
      <div className="quiz-card">
        {history.length > 0 && (
          <div className="back-button" onClick={handleBack}>←</div>
        )}
        <div className="question-title">{question.text}</div>
        <div className="options-grid">
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className="option"
              onClick={() => handleOptionClick(option)}
            >
              <div className="radio"></div>
              <span className="option-text">{option.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
