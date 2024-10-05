// Import necessary modules and initialize variables

let characterCount = 0;
let characterFieldsContainer;
let generateFieldsButton;
let saveButton;
let continueButton;
// Function to generate character fields
function generateCharacterFields(numCharacters) {
  characterFieldsContainer.innerHTML = ""; // Clear previous fields

  for (let i = 0; i < numCharacters; i++) {
    const template = document.getElementById("character-template");
    const clone = template.content.cloneNode(true);

    const inputs = clone.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.id = `${input.name}-${i}`;
    });

    const aiPopulateButton = clone.querySelector(".ai-populate-button");
    aiPopulateButton.dataset.characterIndex = i;
    aiPopulateButton.addEventListener("click", (event) => {
      const index = parseInt(event.target.dataset.characterIndex);
      populateCharacterFields(index);
    });

    characterFieldsContainer.appendChild(clone);
  }
}

// Function to save character data
function saveCharacterData() {
  const characters = [];

  for (let i = 0; i < characterCount; i++) {
    characters.push({
      name: document.getElementById(`character-name-${i}`).value,
      role: document.getElementById(`character-role-${i}`).value,
      age: document.getElementById(`character-age-${i}`).value,
      gender: document.getElementById(`character-gender-${i}`).value,
      description:
        document.getElementById(`character-description-${i}`)?.value || "",
    });
  }

  const jsonOutput = { characters: characters };
  localStorage.setItem("characterData", JSON.stringify(jsonOutput));
  console.log("Character data saved:", JSON.stringify(jsonOutput));
}
// Function to populate fields from AI output
async function populateCharacterFields(index) {
  const aiResponse = await fetchAIResponse(index);

  if (aiResponse.error) {
    console.error("Error fetching AI response:", aiResponse.error);
    return;
  }

  document.getElementById(`character-description-${index}`).value =
    aiResponse.description;
}

// Function for AI integration using OpenRouter API
async function fetchAIResponse(index) {
  const apiKey = localStorage.getItem("openRouterApiKey");
  const selectedModel = localStorage.getItem("selectedModel");

  if (!apiKey || !selectedModel) {
    return { error: "API key or model not set. Please check settings." };
  }

  const name = document.getElementById(`character-name-${index}`).value;
  const role = document.getElementById(`character-role-${index}`).value;
  const age = document.getElementById(`character-age-${index}`).value;
  const gender = document.getElementById(`character-gender-${index}`).value;

  const prompt = `Generate a detailed description for a character with the following attributes:
Name: ${name}
Role: ${role}
Age: ${age}
Gender: ${gender}

Please provide a comprehensive character description including personality traits, background, and relevant details that fit the given attributes.`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { description: data.choices[0].message.content };
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return {
      error: "Failed to generate character description. Please try again.",
    };
  }
}
// Initialize the page and set up event listeners
document.addEventListener("DOMContentLoaded", function () {
  function loadStoryElements() {
    const language = localStorage.getItem("selectedLanguage") || "Not Selected";
    const genre = localStorage.getItem("selectedGenre") || "Not Selected";
    const setting = localStorage.getItem("selectedSetting") || "Not Selected";
    const timeline = localStorage.getItem("selectedTimeline") || "Not Selected";

    document.getElementById("story-language").textContent =
      `🌍 Language: ${language}`;
    document.getElementById("story-genre").textContent = `📚 Genre: ${genre}`;
    document.getElementById("story-setting").textContent =
      `🏙️ Setting: ${setting}`;
    document.getElementById("story-timeline").textContent =
      `🕰️ Timeline: ${timeline}`;
  }

  loadStoryElements();

  characterFieldsContainer = document.getElementById(
    "character-fields-container",
  );
  saveButton = document.getElementById("save-button");

  const characterCountInput = document.getElementById("character-count");
  characterCountInput.value = 1; // Set default character count to 1
  characterFieldsContainer.style.display = "none"; // Hide character fields initially

  // Event listener for save characters button
  saveButton.addEventListener("click", function () {
    characterCount = parseInt(characterCountInput.value);
    generateCharacterFields(characterCount);
    characterFieldsContainer.style.display = "block";
    saveCharacterData();
  });

  console.log("DOM fully loaded and parsed");
});
