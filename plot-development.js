document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded for plot development');

    const savePlotButton = document.getElementById('save-plot');
    const generatePlotButton = document.getElementById('generate-plot');
    const nextStepButton = document.getElementById('next-step');

    if (savePlotButton) {
        savePlotButton.addEventListener('click', savePlot);
        console.log('"Save Plot" button listener added');
    } else {
        console.error('"Save Plot" button not found');
    }

    if (generatePlotButton) {
        generatePlotButton.addEventListener('click', generatePlotWithAI);
        console.log('"Generate with AI" button listener added');
    } else {
        console.error('"Generate with AI" button not found');
    }

    if (nextStepButton) {
        nextStepButton.addEventListener('click', () => {
            window.location.href = 'writing-workspace.html';
        });
        console.log('"Next: Writing Workspace" button listener added');
    } else {
        console.error('"Next: Writing Workspace" button not found');
    }

    loadPlot();
    updateProgressBar();
});

function savePlot() {
    console.log('savePlot function called');
    const plotSummary = document.getElementById('plot-summary').value;
    const mainConflict = document.getElementById('main-conflict').value;
    const plotPoints = document.getElementById('plot-points').value;
    const climax = document.getElementById('climax').value;
    const resolution = document.getElementById('resolution').value;

    if (!plotSummary || !mainConflict || !plotPoints || !climax || !resolution) {
        showError('Please fill in all fields.');
        return;
    }

    const plot = { plotSummary, mainConflict, plotPoints, climax, resolution };
    const plots = JSON.parse(localStorage.getItem('plots') || '[]');
    plots.push(plot);
    localStorage.setItem('plots', JSON.stringify(plots));

    showSuccess('Plot saved successfully!');
    console.log('Plot saved:', plot);
    displayPlot(plot);
}

function loadPlot() {
    const savedPlots = JSON.parse(localStorage.getItem('plots') || '[]');
    savedPlots.forEach(displayPlot);
}

function displayPlot(plot) {
    const plotsList = document.getElementById('plots');
    const plotItem = document.createElement('li');
    plotItem.className = 'bg-white p-4 rounded-lg shadow mb-4';
    plotItem.innerHTML = `
        <div>
            <h3 class='text-xl font-semibold'>📖 Plot Summary: ${plot.plotSummary}</h3>
            <p>🔍 <strong>Main Conflict:</strong> ${plot.mainConflict}</p>
            <p>🗂️ <strong>Key Plot Points:</strong> ${plot.plotPoints}</p>
            <p>🌟 <strong>Climax:</strong> ${plot.climax}</p>
            <p>🔚 <strong>Resolution:</strong> ${plot.resolution}</p>
            <button class='edit-plot text-blue-500 hover:text-blue-700' data-plot='${JSON.stringify(plot)}'>Edit</button>
            <button class='delete-plot text-red-500 hover:text-red-700' data-summary='${plot.plotSummary}'>Delete</button>
        </div>
    `;
    plotsList.appendChild(plotItem);

    plotItem.querySelector('.delete-plot').addEventListener('click', (e) => {
        deletePlot(e.target.dataset.summary);
        plotItem.remove();
    });
}

function deletePlot(plotSummary) {
    let plots = JSON.parse(localStorage.getItem('plots') || '[]');
    plots = plots.filter(plot => plot.plotSummary !== plotSummary);
    localStorage.setItem('plots', JSON.stringify(plots));
    showSuccess('Plot deleted successfully!');
}

async function generatePlotWithAI() {
    console.log('generatePlotWithAI function called');
    const apiKey = localStorage.getItem("openRouterApiKey");
    const selectedModel = "openai/gpt-4o-mini";
    const genre = localStorage.getItem("genre");
    const storyLocation = localStorage.getItem("storyLocation");
    const storyTimeline = localStorage.getItem("storyTimeline");

    console.log("Starting plot generation process");
    console.log("API Key (first 5 chars):", apiKey ? apiKey.substring(0, 5) + "..." : "Not found");
    console.log("Selected model:", selectedModel);

    if (!apiKey) {
        showError("Please save a valid API key in the settings page.");
        return;
    }

    showLoading(true);

    try {
        console.log("Generating plot details...");
        const plotDetails = await generatePlotDetails(apiKey, selectedModel, genre, storyLocation, storyTimeline);
        console.log("Plot details generated:", plotDetails);

        document.getElementById('plot-summary').value = plotDetails.plotSummary;
        document.getElementById('main-conflict').value = plotDetails.mainConflict;
        document.getElementById('plot-points').value = plotDetails.plotPoints;
        document.getElementById('climax').value = plotDetails.climax;
        document.getElementById('resolution').value = plotDetails.resolution;

        showSuccess('Plot generated successfully!');
    } catch (error) {
        console.error("Error generating plot:", error);
        showError(`Error generating plot: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function generatePlotDetails(apiKey, model, genre, location, timeline) {
    console.log("Entering generatePlotDetails function");
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
            { role: "system", content: "You are a creative writing assistant specializing in plot development. Respond with a JSON object containing plotSummary, mainConflict, plotPoints, climax, and resolution keys." },
            { role: "user", content: `Generate a plot for a ${genre} novel set in ${location} during ${timeline}. Include a plot summary, main conflict, key plot points, climax, and resolution.` }
        ],
        response_format: {
            type: 'json_schema',
            json_schema: {
                name: "plot_response",
                schema: {
                    type: "object",
                    properties: {
                        plotSummary: { type: "string" },
                        mainConflict: { type: "string" },
                        plotPoints: { type: "string" },
                        climax: { type: "string" },
                        resolution: { type: "string" }
                    },
                    required: ["plotSummary", "mainConflict", "plotPoints", "climax", "resolution"]
                }
            }
        }
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
        
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonContent = jsonMatch[1] || jsonMatch[0];
            const parsedContent = JSON.parse(jsonContent);
            console.log("Parsed plot details:", parsedContent);
            return parsedContent;
        } else {
            throw new Error("No valid JSON found in the response");
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error("Failed to parse plot details. Please try again.");
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const totalSteps = 5;
        const currentStep = 4; // Plot Development is the fourth step
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    } else {
        console.error('Progress bar element not found');
    }
}

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