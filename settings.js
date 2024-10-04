// JavaScript for Settings Page
console.log("Settings page initialized");

let tokenDistributionChart, costChart, balanceGauge;

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
  const selectedModel = models.find((model) => model.value === modelValue);
  if (selectedModel) {
    const costDisplay = document.getElementById("cost-display");
    costDisplay.textContent = `Prompt Cost: $${selectedModel.promptCost.toFixed(4)} | Completion Cost: $${selectedModel.completionCost.toFixed(4)} | Context Limit: ${selectedModel.contextLimit.toLocaleString()} tokens`;
  }
}

function showConnectionModal(title, message, usage) {
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalUsage = document.getElementById("modal-usage");
  const modal = document.getElementById("connection-modal");

  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalUsage.textContent = usage;

  modal.classList.remove("hidden");
}

function closeConnectionModal() {
  const modal = document.getElementById("connection-modal");
  modal.classList.add("hidden");
}

document
  .getElementById("close-modal")
  .addEventListener("click", closeConnectionModal);

function testConnection() {
  const testConnectionButton = document.getElementById("test-connection");
  const selectedModel = document.querySelector(
    'input[name="model-select"]:checked',
  );
  const apiKey = localStorage.getItem("openRouterApiKey");
  const connectionStatus = document.getElementById("connection-status");

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
  const selectedModelInfo = models.find((model) => model.value === modelName);

  fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.href,
      "X-Title": "Novel-Building Assistant",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Respond with a brief message confirming your identity and that the connection is working.",
        },
        {
          role: "user",
          content: "Please confirm that you're working correctly.",
        },
      ],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("API Response:", data); // Log the full response for debugging
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const promptTokens = data.usage.prompt_tokens;
        const completionTokens = data.usage.completion_tokens;
        const totalTokens = data.usage.total_tokens;
        const promptCost = (
          (promptTokens * selectedModelInfo.promptCost) /
          1000
        ).toFixed(4);
        const completionCost = (
          (completionTokens * selectedModelInfo.completionCost) /
          1000
        ).toFixed(4);
        const totalCost = (
          parseFloat(promptCost) + parseFloat(completionCost)
        ).toFixed(4);

        const usage = `
Model: ${selectedModelInfo.name}

Tokens Used:
- Prompt: ${promptTokens}
- Completion: ${completionTokens}
- Total: ${totalTokens}

Costs:
- Prompt Cost: $${promptCost}
- Completion Cost: $${completionCost}
Total Cost: $${totalCost}
      `;

        showConnectionModal(
          "Connection Successful",
          `Model response: ${data.choices[0].message.content}\n\nYou are using ${selectedModelInfo.name}.`,
          usage,
        );
        updateCharts(
          promptTokens,
          completionTokens,
          promptCost,
          completionCost,
          totalCost,
        );

        // Fetch updated balance after the request
        fetchRemainingBalance();
      } else {
        throw new Error("Unexpected response from the model");
      }
    })
    .catch((error) => {
      console.error("Error testing connection:", error);
      showConnectionModal("Connection Error", error.message, "");
    })
    .finally(() => {
      testConnectionButton.disabled = false;
      // Fetch updated balance after the request, even if there was an error
      fetchRemainingBalance();
    });
}

function updateCharts(
  promptTokens,
  completionTokens,
  promptCost,
  completionCost,
  totalCost,
) {
  // Update Token Distribution Chart
  tokenDistributionChart.data.datasets[0].data = [
    promptTokens,
    completionTokens,
  ];
  tokenDistributionChart.update();

  // Update Cost Chart
  costChart.data.datasets[0].data = [promptCost, completionCost];
  costChart.update();

  // Update Total Cost
  document.getElementById("totalCost").textContent = `$${totalCost}`;

  // Fetch and update remaining balance
  fetchRemainingBalance();
}

function fetchRemainingBalance() {
  const apiKey = localStorage.getItem("openRouterApiKey");

  if (!apiKey) {
    console.error("No API Key found.");
    document.getElementById("remainingBalance").textContent =
      "API Key not provided";
    updateBalanceGauge(0, 100);
    return;
  }

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
      console.log("API Response for Remaining Balance:", data); // Log the response for debugging

      if (data && data.data) {
        const { usage } = data.data;

        if (typeof usage === "number") {
          let balanceText = `$${usage.toFixed(2)} USD`;

          const balanceElement = document.getElementById("remainingBalance");
          balanceElement.textContent = balanceText;
          balanceElement.classList.add("text-sm"); // Ensure text size remains small

          updateBalanceGauge(usage, usage > 0 ? 100 : 0); // Update gauge based on usage
        } else {
          throw new Error(
            "Unexpected data format: usage is undefined or invalid",
          );
        }
      } else {
        throw new Error("Balance data not found or invalid in the response");
      }
    })
    .catch((error) => {
      console.error("Error fetching remaining balance:", error);
      document.getElementById("remainingBalance").textContent =
        "Balance data not available";
      updateBalanceGauge(0, 100); // Update gauge to show 0 balance on error
    });
}

function updateBalanceGauge(balance, maxBalance) {
  let percentage;

  if (maxBalance === null || maxBalance === 0) {
    percentage = 100; // Full gauge for unlimited credits or when maxBalance is 0 or null
  } else {
    percentage = Math.min((balance / maxBalance) * 100, 100); // Cap at 100%
  }

  balanceGauge.data.datasets[0].data = [percentage, 100 - percentage];
  balanceGauge.update();
}

function populateModelAccordion() {
  const modelAccordion = document.getElementById("model-accordion");
  modelAccordion.innerHTML = "";

  const logoMap = {
    openai: "chat-gpt-logo-black.svg",
    anthropic: "claude-logo-black.svg",
    google: "bard-logo.gif",
    mistralai: "mistral-ai-logo.svg",
    meta: "logo-llama.svg",
    midjourney: "midjourney-logo.svg",
    stability: "leonardo-logo.svg",
    ideogram: "ideogram-logo.svg",
    inflection: "flux-logo.svg",
  };

  models.forEach((model, index) => {
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item mb-4";

    const provider = model.value.split("/")[0];
    const logoFileName = logoMap[provider] || "default-logo.svg";

    accordionItem.innerHTML = `
      <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md cursor-pointer accordion-header">
        <div class="flex items-center">
          <img src="LLMS_Logos/${logoFileName}" alt="${model.name} Logo" class="h-8 w-8 object-contain mr-4">
          <h3 class="text-lg font-semibold">${model.name}</h3>
        </div>
        <button class="accordion-toggle text-2xl font-bold">+</button>
      </div>
      <div class="accordion-content hidden mt-2 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <span class="font-semibold">Context Limit</span>
            <p>${model.contextLimit.toLocaleString()}</p>
          </div>
          <div class="text-center">
            <span class="font-semibold">Prompt Cost</span>
            <p>$${model.promptCost.toFixed(4)}</p>
          </div>
          <div class="text-center">
            <span class="font-semibold">Completion Cost</span>
            <p>$${model.completionCost.toFixed(4)}</p>
          </div>
        </div>
        <div class="flex justify-center">
          <input type="radio" name="model-select" value="${model.value}" id="model-${index}" class="mr-2">
          <label for="model-${index}" class="font-medium">Select this model</label>
        </div>
      </div>
    `;

    modelAccordion.appendChild(accordionItem);
  });

  // Add event listeners for accordion functionality
  document.querySelectorAll(".accordion-toggle").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const accordionHeader = button.closest(".accordion-header");
      const accordionContent = accordionHeader.nextElementSibling;
      button.textContent = accordionContent.classList.contains("hidden")
        ? "-"
        : "+";
      accordionContent.classList.toggle("hidden");
      accordionHeader.classList.toggle("bg-blue-100");
    });
  });

  // Add event listener for radio buttons
  document.querySelectorAll('input[name="model-select"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      updateCostDisplay(this.value);
    });
  });

  loadSelectedModel();
}

document.addEventListener("DOMContentLoaded", function () {
  populateModelAccordion();

  const testConnectionButton = document.getElementById("test-connection");
  const connectionStatus = document.getElementById("connection-status");

  testConnectionButton.addEventListener("click", testConnection);

  // Initialize charts
  initializeCharts();
});

function initializeCharts() {
  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  // Token Distribution Chart
  const tokenCtx = document
    .getElementById("tokenDistributionChart")
    .getContext("2d");
  tokenDistributionChart = new Chart(tokenCtx, {
    type: "pie",
    data: {
      labels: ["Prompt Tokens", "Completion Tokens"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#3B82F6", "#93C5FD"],
        },
      ],
    },
    options: {
      ...chartOptions,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Token Distribution",
        },
      },
    },
  });

  // Cost Chart
  const costCtx = document.getElementById("costChart").getContext("2d");
  costChart = new Chart(costCtx, {
    type: "bar",
    data: {
      labels: ["Prompt Cost", "Completion Cost"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#3B82F6", "#93C5FD"],
        },
      ],
    },
    options: {
      ...chartOptions,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Cost Breakdown",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toFixed(4);
            },
          },
        },
      },
    },
  });

  // Balance Gauge
  const gaugeCtx = document.getElementById("balanceGauge").getContext("2d");
  balanceGauge = new Chart(gaugeCtx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ["#3B82F6", "#E5E7EB"],
          circumference: 180,
          rotation: 270,
        },
      ],
    },
    options: {
      ...chartOptions,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      cutout: "80%",
    },
  });
}

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
  document.querySelectorAll('input[name="model-select"]').forEach((radio) => {
    radio.addEventListener("change", function () {
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
