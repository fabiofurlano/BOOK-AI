// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Add event listener for the "Save Plot" button
    const addPlotButton = document.getElementById('add-plot');
    if (addPlotButton) {
        addPlotButton.addEventListener('click', savePlot);
        console.log('"Save Plot" button listener added');
    } else {
        console.error('"Save Plot" button not found');
    }

    // Add event listener for the "Generate Plots with AI" button
    const generatePlotsButton = document.getElementById('generate-plots');
    if (generatePlotsButton) {
        generatePlotsButton.addEventListener('click', generatePlotsWithAI);
        console.log('"Generate Plots with AI" button listener added');
    } else {
        console.error('"Generate Plots with AI" button not found');
    }

    // Add event listener for the "Next: Writing Workspace" button
    const nextStepButton = document.getElementById('next-step');
    if (nextStepButton) {
        nextStepButton.addEventListener('click', () => {
            window.location.href = 'writing-workspace.html';
        });
        console.log('"Next: Writing Workspace" button listener added');
    } else {
        console.error('"Next: Writing Workspace" button not found');
    }

    // Load plots from local storage
    loadPlots();

    // Update progress bar
    updateProgressBar();
});

function savePlot() {
    console.log('savePlot function called');
    const summary = document.getElementById('plot-summary').value;
    const keyEvents = document.getElementById('key-events').value;

    if (!summary || !keyEvents) {
        showError('Please fill in both the plot summary and key events.');
        return;
    }

    const plot = { summary, keyEvents };
    const plots = JSON.parse(localStorage.getItem('plots') || '[]');
    plots.push(plot);
    localStorage.setItem('plots', JSON.stringify(plots));

    displayPlot(plot);
    clearForm();
    showSuccess('Plot saved successfully!');
    console.log('Plot saved:', plot);
}

function displayPlot(plot) {
    const plotList = document.getElementById('plots');
    const plotItem = document.createElement('li');
    plotItem.className = 'bg-white p-4 rounded-lg shadow mb-4';
    plotItem.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-grow">
                <h3 class="text-xl font-semibold">Plot Summary</h3>
                <p class="mt-2">${plot.summary}</p>
                <h4 class="text-lg font-semibold mt-4">Key Events</h4>
                <p class="mt-2">${plot.keyEvents}</p>
            </div>
            <div class="flex flex-col space-y-2">
                <button class="edit-plot text-blue-500 hover:text-blue-700">Edit</button>
                <button class="delete-plot text-red-500 hover:text-red-700">Delete</button>
            </div>
        </div>
    `;
    plotList.appendChild(plotItem);

    // Add event listener for edit button
    plotItem.querySelector('.edit-plot').addEventListener('click', () => {
        editPlot(plot);
    });

    // Add event listener for delete button
    plotItem.querySelector('.delete-plot').addEventListener('click', () => {
        deletePlot(plot);
        plotItem.remove();
    });
}

function editPlot(plot) {
    document.getElementById('plot-summary').value = plot.summary;
    document.getElementById('key-events').value = plot.keyEvents;
    document.getElementById('add-plot').textContent = 'Update Plot';
    document.getElementById('add-plot').dataset.editing = 'true';
    document.getElementById('add-plot').dataset.originalSummary = plot.summary;
}

function deletePlot(plot) {
    let plots = JSON.parse(localStorage.getItem('plots') || '[]');
    plots = plots.filter(p => p.summary !== plot.summary);
    localStorage.setItem('plots', JSON.stringify(plots));
    showSuccess('Plot deleted successfully!');
}

function loadPlots() {
    const plots = JSON.parse(localStorage.getItem('plots') || '[]');
    const plotList = document.getElementById('plots');
    plotList.innerHTML = ''; // Clear existing plots
    plots.forEach(displayPlot);
}

function clearForm() {
    document.getElementById('plot-summary').value = '';
    document.getElementById('key-events').value = '';
    document.getElementById('add-plot').textContent = 'Save Plot';
    document.getElementById('add-plot').dataset.editing = 'false';
    delete document.getElementById('add-plot').dataset.originalSummary;
}

async function generatePlotsWithAI() {
    console.log('generatePlotsWithAI function called');
    const apiKey = localStorage.getItem("openRouterApiKey");
    const selectedModel = localStorage.getItem("selectedModel") || "openai/gpt-3.5-turbo";

    console.log("Starting plot generation process");
    console.log("API Key (first 5 chars):", apiKey ? apiKey.substring(0, 5) + "..." : "Not found");
    console.log("Selected model:", selectedModel);

    if (!apiKey) {
        showError("Please save a valid API key in the settings page.");
        return;
    }

    showLoading(true);

    try {
        console.log("Generating plot options...");
        const plotOptions = await generatePlotOptions(apiKey, selectedModel);
        console.log("Plot options generated:", plotOptions);

        displayPlotOptions(plotOptions);
        showSuccess('Plot options generated successfully!');
    } catch (error) {
        console.error("Error generating plots:", error);
        showError(`Error generating plots: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function generatePlotOptions(apiKey, model) {
    console.log("Entering generatePlotOptions function");
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href,
        "X-Title": "Novel-Building Assistant"
    };
    const data = {
        model: model,
        messages: [
            { role: "system", content: "You are a creative writing assistant specializing in plot development. Generate three unique plot options, each containing a summary and key events. Respond with a JSON array of three objects, each with 'summary' and 'keyEvents' properties." },
            { role: "user", content: "Generate three unique and engaging plot options for a novel." }
        ]
    };

    console.log("Sending request to OpenRouter API");
    const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(`Plot generation failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    console.log("API response:", result);

    try {
        const content = result.choices[0].message.content;
        console.log("Raw content:", content);
        
        // Extract JSON from the content (it might be wrapped in markdown code blocks)
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const jsonContent = jsonMatch[1] || jsonMatch[0];
            const parsedContent = JSON.parse(jsonContent);
            console.log("Parsed plot options:", parsedContent);
            return parsedContent;
        } else {
            throw new Error("No valid JSON found in the response");
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error("Failed to parse plot options. Please try again.");
    }
}

function displayPlotOptions(plotOptions) {
    const plotOptionsContainer = document.getElementById('plot-options');
    plotOptionsContainer.innerHTML = '';
    
    plotOptions.forEach((plot, index) => {
        const plotOption = document.createElement('div');
        plotOption.className = 'bg-white p-4 rounded-lg shadow mb-4';
        plotOption.innerHTML = `
            <h3 class="text-xl font-semibold">Plot Option ${index + 1}</h3>
            <p class="mt-2"><strong>Summary:</strong> ${plot.summary}</p>
            <p class="mt-2"><strong>Key Events:</strong> ${plot.keyEvents}</p>
            <button class="choose-plot mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out">Choose This Plot</button>
        `;
        plotOptionsContainer.appendChild(plotOption);

        // Add event listener for choose button
        plotOption.querySelector('.choose-plot').addEventListener('click', () => {
            document.getElementById('plot-summary').value = plot.summary;
            document.getElementById('key-events').value = plot.keyEvents;
            document.getElementById('generated-plots').classList.add('hidden');
            document.getElementById('plot-form').scrollIntoView({ behavior: 'smooth' });
        });
    });

    document.getElementById('generated-plots').classList.remove('hidden');
}

// Function to update the progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const totalSteps = 5; // Adjust this based on the total number of steps in your app
        const currentStep = 3; // Plot Development is the third step
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    } else {
        console.error('Progress bar element not found');
    }
}

// Helper functions for user feedback
function showLoading(isLoading) {
    let loadingElement = document.getElementById('loading');
    if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.id = 'loading';
        loadingElement.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
        loadingElement.innerHTML = '<div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>';
        document.body.appendChild(loadingElement);
    }
    loadingElement.style.display = isLoading ? 'flex' : 'none';
}

function showError(message) {
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        document.body.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    let successElement = document.getElementById('success-message');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.id = 'success-message';
        successElement.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        document.body.appendChild(successElement);
    }
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 5000);
}