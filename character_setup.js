// Initialize variables
let characterCount = 0;
let characterFieldsContainer;
let manualModeButton;
let aiModeButton;
let characterCountInput;
let selectedLanguage;
let selectedGenre;
let selectedLocation;
let selectedTimeline;

// Function to generate character fields in Manual Mode
function generateCharacterFieldsManual(numCharacters) {
  characterFieldsContainer.innerHTML = ""; // Clear previous fields

  for (let i = 0; i < numCharacters; i++) {
    const template = document.getElementById("character-template-manual");
    const clone = template.content.cloneNode(true);

    const inputs = clone.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.id = `${input.name}-${i}`;
    });

    characterFieldsContainer.appendChild(clone);
  }
}

// Function to generate character fields in AI-Assisted Mode
function generateCharacterFieldsAI(numCharacters) {
  characterFieldsContainer.innerHTML = ""; // Clear previous fields

  for (let i = 0; i < numCharacters; i++) {
    const template = document.getElementById("character-template-ai");
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
Story Language: ${selectedLanguage}
Story Genre: ${selectedGenre}
Story Location: ${selectedLocation}
Story Timeline: ${selectedTimeline}

Please provide a comprehensive character description including personality traits, background, and relevant details that fit the given attributes and story elements.`;

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

// Function to load story elements from localStorage
function loadStoryElements() {
  selectedLanguage = localStorage.getItem("selectedLanguage") || "Not Selected";
  selectedGenre = localStorage.getItem("selectedGenre") || "Not Selected";
  selectedLocation = localStorage.getItem("selectedLocation") || "Not Selected";
  selectedTimeline = localStorage.getItem("selectedTimeline") || "Not Selected";

  updateSidebar();
}

function updateSidebar() {
  document.getElementById("story-language").textContent = `🌍 Language: ${selectedLanguage}`;
  document.getElementById("story-genre").textContent = `📚 Genre: ${selectedGenre}`;
  document.getElementById("story-location").textContent = `🏙️ Location: ${selectedLocation}`;
  document.getElementById("story-timeline").textContent = `🕰️ Timeline: ${selectedTimeline}`;
}

// Initialize the page and set up event listeners
document.addEventListener("DOMContentLoaded", function () {
  loadStoryElements();

  characterFieldsContainer = document.getElementById(
    "character-fields-container",
  );
  characterCountInput = document.getElementById("character-count");
  manualModeButton = document.getElementById("manual-mode-button");
  aiModeButton = document.getElementById("ai-mode-button");

  characterCountInput.value = 1; // Set default character count to 1
  characterFieldsContainer.style.display = "none"; // Hide character fields initially

  // Event listener for Manual Mode button
  manualModeButton.addEventListener("click", function () {
    characterCount = parseInt(characterCountInput.value);
    generateCharacterFieldsManual(characterCount);
    characterFieldsContainer.style.display = "block";
  });

  // Event listener for AI-Assisted Mode button
  aiModeButton.addEventListener("click", function () {
    characterCount = parseInt(characterCountInput.value);
    generateCharacterFieldsAI(characterCount);
    characterFieldsContainer.style.display = "block";
  });

  // Listen for story element updates
  document.addEventListener('storyElementUpdated', function(e) {
    console.log('Event received:', e.detail);
    const { type, value } = e.detail;
    switch (type) {
      case "language":
        selectedLanguage = value;
        break;
      case "genre":
        selectedGenre = value;
        break;
      case "location":
        selectedLocation = value;
        break;
      case "timeline":
        selectedTimeline = value;
        break;
    }
    updateSidebar();
  });

  console.log("DOM fully loaded and parsed");
});
