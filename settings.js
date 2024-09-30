console.log("Settings page initialized");

function loadSelectedModel() {
  const savedModel = localStorage.getItem("selectedModel");
  if (savedModel) {
    const radioButton = document.querySelector(
      `input[name="model-select"][value="${savedModel}"]`,
    );
    if (radioButton) {
      radioButton.checked = true;
      updateCostDisplay(savedModel);
    }
  }
}

function updateCostDisplay(modelValue) {
  const selectedModel = models.find(model => model.value === modelValue);
  if (selectedModel) {
    const costDisplay = document.getElementById("cost-display");
    costDisplay.textContent = `Prompt Cost: $${selectedModel.promptCost.toFixed(4)} | Completion Cost: $${selectedModel.completionCost.toFixed(4)} | Context Limit: ${selectedModel.contextLimit.toLocaleString()} tokens`;
  }
}

function testConnection() {
  const selectedModel = document.querySelector(
    'input[name="model-select"]:checked'
  );
  const apiKey = localStorage.getItem("openRouterApiKey");

  if (!selectedModel) {
    connectionStatus.textContent = "Please select a model first.";
    return;
  }

  if (!apiKey) {
    connectionStatus.textContent = "Please save a valid API key first.";
    return;
  }

  connectionStatus.textContent = "Testing connection...";
  testConnectionButton.disabled = true;

  const modelName = selectedModel.value;

  fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.href,
      "X-Title": "Novel-Building Assistant",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with a brief message confirming your identity and that the connection is working."
        },
        {
          role: "user",
          content: "Please confirm that you're working correctly."
        }
      ]
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.choices && data.choices[0] && data.choices[0].message) {
        connectionStatus.textContent = `Connection successful. Model response: ${data.choices[0].message.content}`;
      } else {
        connectionStatus.textContent = "Unexpected response from the model. Please try again.";
      }
    })
    .catch(error => {
      console.error("Error testing connection:", error);
      if (error.message.includes("401")) {
        connectionStatus.textContent = "Invalid API Key. Please check and try again.";
      } else if (error.message.includes("402")) {
        connectionStatus.textContent = "Your OpenRouter account has insufficient funds. Please recharge your account.";
      } else {
        connectionStatus.textContent = "Error testing connection. Please check your API key and selected model.";
      }
    })
    .finally(() => {
      testConnectionButton.disabled = false;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  populateModelTable();

  const testConnectionButton = document.getElementById("test-connection");
  const connectionStatus = document.getElementById("connection-status");

  testConnectionButton.addEventListener("click", testConnection);
});

const models = [
  {
    name: "OpenAI: GPT-4o",
    value: "openai/gpt-4o",
    contextLimit: 128000,
    promptCost: 2.5,
    completionCost: 10,
  },
  {
    name: "OpenAI: GPT-40 Mini",
    value: "openai/gpt-40-mini",
    contextLimit: 128000,
    promptCost: 0.15,
    completionCost: 0.6,
  },
  {
    name: "OpenAI: GPT-o1-preview",
    value: "openai/gpt-o1-preview",
    contextLimit: 128000,
    promptCost: 15,
    completionCost: 60,
  },
  {
    name: "OpenAI: GPT-o1-mini",
    value: "openai/gpt-o1-mini",
    contextLimit: 128000,
    promptCost: 3,
    completionCost: 12,
  },
  {
    name: "OpenAI: GPT-3.5 Turbo",
    value: "openai/gpt-3.5-turbo",
    contextLimit: 16385,
    promptCost: 0.5,
    completionCost: 1.5,
  },
  {
    name: "Anthropic: Claude 2",
    value: "anthropic/claude-2",
    contextLimit: 200000,
    promptCost: 3,
    completionCost: 15,
  },
  {
    name: "Anthropic: Claude Sonnet",
    value: "anthropic/claude-sonnet",
    contextLimit: 200000,
    promptCost: 3,
    completionCost: 15,
  },
  {
    name: "Google: Gemini Pro",
    value: "google/gemini-pro",
    contextLimit: 131040,
    promptCost: 0.125,
    completionCost: 0.375,
  },
  {
    name: "Google: Gemini Flash",
    value: "google/gemini-flash",
    contextLimit: 4000000,
    promptCost: 0.0375,
    completionCost: 0.15,
  },
];

function populateModelTable() {
  const modelList = document.getElementById("model-list");
  modelList.innerHTML = "";

  models.forEach((model, index) => {
    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "bg-gray-50" : "bg-white";
    row.innerHTML = `
      <td class="px-4 py-2">${model.name}</td>
      <td class="px-4 py-2">${model.contextLimit.toLocaleString()}</td>
      <td class="px-4 py-2">$${model.promptCost.toFixed(4)}</td>
      <td class="px-4 py-2">$${model.completionCost.toFixed(4)}</td>
      <td class="px-4 py-2">
        <input type="radio" name="model-select" value="${model.value}" id="model-${index}">
      </td>
    `;
    modelList.appendChild(row);
  });

  // Add event listener for radio buttons
  document.querySelectorAll('input[name="model-select"]').forEach(radio => {
    radio.addEventListener('change', function() {
      updateCostDisplay(this.value);
    });
  });

  loadSelectedModel();
}

const apiKeyInput = document.getElementById("api-key-input");
const saveApiKeyButton = document.getElementById("save-api-key");
const apiKeyStatus = document.getElementById("api-key-status");

// Load saved API key if it exists
const savedApiKey = localStorage.getItem("openRouterApiKey");

if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
  apiKeyStatus.textContent = "API Key is saved";
}

function enableSaveButton() {
  saveApiKeyButton.disabled = false;
}

saveApiKeyButton.addEventListener("click", function () {
  const apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    apiKeyStatus.textContent = "Validating API Key...";
    saveApiKeyButton.disabled = true;
    testApiKey(apiKey);
  } else {
    apiKeyStatus.textContent = "Please enter a valid API Key";
  }
});

document
  .getElementById("model-list")
  .addEventListener("change", function (event) {
    if (event.target.type === "radio") {
      const selectedModel = event.target.value;
      localStorage.setItem("selectedModel", selectedModel);
      updateCostDisplay(selectedModel);
      console.log("Selected model:", selectedModel);
    }
  });

function testApiKey(apiKey) {
  console.log("Testing API Key:", apiKey);
  apiKeyStatus.textContent = "Validating API Key...";

  fetch("https://openrouter.ai/api/v1/auth/key", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("API Key validation successful:", data);
      apiKeyStatus.textContent = "API Key is valid and working";
      localStorage.setItem("openRouterApiKey", apiKey);
      enableSaveButton();
    })
    .catch((error) => {
      console.error("Error validating API Key:", error);
      if (error.message.includes("401")) {
        apiKeyStatus.textContent =
          "Invalid API Key. Please check and try again.";
      } else if (error.message.includes("402")) {
        apiKeyStatus.textContent =
          "Your OpenRouter account has insufficient funds. Please recharge your account.";
      } else {
        apiKeyStatus.textContent =
          "An error occurred while validating the API Key. Please try again later.";
      }
      enableSaveButton();
    });
}
