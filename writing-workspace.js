document.addEventListener('DOMContentLoaded', () => {
    console.log('Writing Workspace loaded');

    // Load story information
    loadStoryInfo();

    // Load characters and plots
    loadCharacters();
    loadPlots();

    // Load AI information
    loadAIInfo();

    // Set up event listeners
    setupEventListeners();

    // Update progress bar
    updateProgressBar();

    // Load saved story content
    loadStoryContent();
});

function loadStoryInfo() {
    const storyInfo = JSON.parse(localStorage.getItem('storyInfo') || '{}');
    const storyInfoElement = document.getElementById('story-info');
    
    if (storyInfo.genre && storyInfo.bookType) {
        storyInfoElement.innerHTML = `
            <p><strong>Genre:</strong> ${storyInfo.genre}</p>
            <p><strong>Book Type:</strong> ${storyInfo.bookType}</p>
        `;
    } else {
        storyInfoElement.innerHTML = '<p>No story information available.</p>';
    }
}

function loadCharacters() {
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    const charactersList = document.getElementById('characters-list');
    charactersList.innerHTML = ''; // Clear existing content
    if (characters.length > 0) {
        characters.forEach(character => {
            const characterElement = document.createElement('div');
            characterElement.className = 'mb-2 p-2 bg-indigo-100 rounded-lg';
            characterElement.textContent = `${character.name} (${character.role})`;
            characterElement.title = `${character.description}\nMotivation: ${character.motivation}`;
            charactersList.appendChild(characterElement);
        });
    } else {
        charactersList.innerHTML = '<p>No characters created yet.</p>';
    }
}

function loadPlots() {
    const plots = JSON.parse(localStorage.getItem('plots') || '[]');
    const plotsList = document.getElementById('plots-list');
    plotsList.innerHTML = ''; // Clear existing content
    if (plots.length > 0) {
        plots.forEach(plot => {
            const plotElement = document.createElement('div');
            plotElement.className = 'mb-2 p-2 bg-indigo-100 rounded-lg';
            plotElement.textContent = plot.summary;
            plotElement.title = `Key Events: ${plot.keyEvents}`;
            plotsList.appendChild(plotElement);
        });
    } else {
        plotsList.innerHTML = '<p>No plots created yet.</p>';
    }
}

function loadAIInfo() {
    const aiInfo = document.getElementById('ai-info');
    const selectedModel = localStorage.getItem('selectedModel') || 'Not set';
    const tokenCount = localStorage.getItem('tokenCount') || '0';

    aiInfo.innerHTML = `
        <p><strong>Model:</strong> ${selectedModel}</p>
        <p><strong>Tokens Used:</strong> ${tokenCount}</p>
    `;
}

function setupEventListeners() {
    const storyContent = document.getElementById('story-content');
    const wordCount = document.getElementById('word-count');
    const saveStoryButton = document.getElementById('save-story');
    const aiAssistButton = document.getElementById('ai-assist');

    storyContent.addEventListener('input', () => {
        const words = storyContent.value.trim().split(/\s+/).length;
        wordCount.textContent = `Words: ${words}`;
    });

    saveStoryButton.addEventListener('click', saveStory);
    aiAssistButton.addEventListener('click', getAIAssistance);
}

function saveStory() {
    const storyContent = document.getElementById('story-content').value;
    localStorage.setItem('storyContent', storyContent);
    showSuccess('Story saved successfully!');
}

function loadStoryContent() {
    const storyContent = document.getElementById('story-content');
    const savedContent = localStorage.getItem('storyContent');
    if (savedContent) {
        storyContent.value = savedContent;
        const words = savedContent.trim().split(/\s+/).length;
        document.getElementById('word-count').textContent = `Words: ${words}`;
    }
}

async function getAIAssistance() {
    const apiKey = localStorage.getItem("openRouterApiKey");
    const selectedModel = localStorage.getItem("selectedModel") || "openai/gpt-3.5-turbo";
    const storyContent = document.getElementById('story-content').value;

    if (!apiKey) {
        showError("Please save a valid API key in the settings page.");
        return;
    }

    showLoading(true);

    try {
        const assistance = await generateAIAssistance(apiKey, selectedModel, storyContent);
        document.getElementById('story-content').value += "\n\n" + assistance;
        showSuccess('AI assistance added to your story!');
        
        // Update token count (this is an estimate, adjust as needed)
        const currentTokens = parseInt(localStorage.getItem('tokenCount') || '0');
        const newTokens = currentTokens + Math.ceil(assistance.length / 4); // Rough estimate
        localStorage.setItem('tokenCount', newTokens.toString());
        loadAIInfo(); // Reload AI info to update token count
    } catch (error) {
        console.error("Error getting AI assistance:", error);
        showError(`Error getting AI assistance: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function generateAIAssistance(apiKey, model, storyContent) {
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
            { role: "system", content: "You are a creative writing assistant. Provide a continuation or suggestion for the given story content." },
            { role: "user", content: `Here's my current story. Please provide a suggestion for the next part:\n\n${storyContent}` }
        ]
    };

    const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI assistance failed: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const totalSteps = 5; // Adjust this based on the total number of steps in your app
        const currentStep = 4; // Writing Workspace is the fourth step
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