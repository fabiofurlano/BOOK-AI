document.addEventListener('DOMContentLoaded', () => {
    console.log('Writing Workspace loaded');

    loadStoryInfo();
    loadCharacters();
    loadPlots();
    loadAIInfo();
    setupEventListeners();
    updateProgressBar();
    loadChapters();
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
    charactersList.innerHTML = '<h3 class="text-xl font-semibold mb-2">Characters</h3>';
    characters.forEach(character => {
        const characterElement = document.createElement('div');
        characterElement.className = 'mb-2 p-2 bg-blue-100 rounded-lg';
        characterElement.textContent = `${character.name} (${character.role})`;
        characterElement.title = `${character.description}\nMotivation: ${character.motivation}`;
        charactersList.appendChild(characterElement);
    });
}

function loadPlots() {
    const plot = JSON.parse(localStorage.getItem('plot') || '{}');
    const plotsList = document.getElementById('plots-list');
    plotsList.innerHTML = '<h3 class="text-xl font-semibold mb-2">Plot</h3>';
    if (plot.plotSummary) {
        const plotElement = document.createElement('div');
        plotElement.className = 'mb-2 p-2 bg-blue-100 rounded-lg';
        plotElement.innerHTML = `
            <p><strong>Summary:</strong> ${plot.plotSummary}</p>
            <p><strong>Main Conflict:</strong> ${plot.mainConflict}</p>
            <p><strong>Key Points:</strong> ${plot.plotPoints}</p>
            <p><strong>Climax:</strong> ${plot.climax}</p>
            <p><strong>Resolution:</strong> ${plot.resolution}</p>
        `;
        plotsList.appendChild(plotElement);
    } else {
        plotsList.innerHTML += '<p>No plot information available.</p>';
    }
}

function loadAIInfo() {
    const aiInfo = document.getElementById('ai-info');
    const selectedModel = localStorage.getItem('selectedModel') || 'Not set';
    const tokenCount = localStorage.getItem('tokenCount') || '0';

    aiInfo.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">AI Information</h3>
        <p><strong>Model:</strong> ${selectedModel}</p>
        <p><strong>Tokens Used:</strong> ${tokenCount}</p>
    `;
}

function setupEventListeners() {
    const createChapterButton = document.getElementById('create-chapter');
    const saveStoryButton = document.getElementById('save-story');
    const aiAssistButton = document.getElementById('ai-assist');

    createChapterButton.addEventListener('click', createNewChapter);
    saveStoryButton.addEventListener('click', saveStory);
    aiAssistButton.addEventListener('click', getAIAssistance);
}

function saveStory() {
    const chapters = getChaptersContent();
    localStorage.setItem('chapters', JSON.stringify(chapters));
    showSuccess('Story saved successfully!');
}

function loadChapters() {
    const chapters = JSON.parse(localStorage.getItem('chapters') || '[]');
    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = '';
    chapters.forEach((chapterContent, index) => {
        createChapterElement(index + 1, chapterContent);
    });
    updateWordCount();
}

function createNewChapter() {
    const chaptersContainer = document.getElementById('chapters-container');
    const chapterCount = chaptersContainer.children.length + 1;
    createChapterElement(chapterCount, '');
    updateWordCount();
}

function createChapterElement(chapterNumber, content) {
    const chaptersContainer = document.getElementById('chapters-container');
    const chapterElement = document.createElement('div');
    chapterElement.className = 'mb-4 p-4 bg-gray-100 rounded-lg';
    chapterElement.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">Chapter ${chapterNumber}</h3>
        <textarea class="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" rows="10" placeholder="Write your chapter content here...">${content}</textarea>
        <button class="generate-chapter-ai mt-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">Generate with AI</button>
    `;
    chaptersContainer.appendChild(chapterElement);

    const textarea = chapterElement.querySelector('textarea');
    textarea.addEventListener('input', updateWordCount);

    const generateChapterButton = chapterElement.querySelector('.generate-chapter-ai');
    generateChapterButton.addEventListener('click', () => generateChapterWithAI(chapterNumber));
}

function getChaptersContent() {
    const chaptersContainer = document.getElementById('chapters-container');
    return Array.from(chaptersContainer.children).map(chapterElement => {
        return chapterElement.querySelector('textarea').value;
    });
}

function updateWordCount() {
    const chapters = getChaptersContent();
    const totalWords = chapters.reduce((count, chapter) => {
        return count + chapter.trim().split(/\s+/).length;
    }, 0);
    document.getElementById('word-count').textContent = `Words: ${totalWords}`;
}

async function generateChapterWithAI(chapterNumber) {
    const apiKey = localStorage.getItem("openRouterApiKey");
    const selectedModel = localStorage.getItem("selectedModel") || "openai/gpt-3.5-turbo";
    const chapterTextarea = document.querySelector(`#chapters-container div:nth-child(${chapterNumber}) textarea`);
    const chapterContent = chapterTextarea.value;

    if (!apiKey) {
        showError("Please save a valid API key in the settings page.");
        return;
    }

    showLoading(true);

    try {
        const storyInfo = JSON.parse(localStorage.getItem('storyInfo') || '{}');
        const characters = JSON.parse(localStorage.getItem('characters') || '[]');
        const plot = JSON.parse(localStorage.getItem('plot') || '{}');

        const generatedContent = await generateAIAssistance(apiKey, selectedModel, chapterContent, chapterNumber, storyInfo, characters, plot);
        chapterTextarea.value += "\n\n" + generatedContent;
        showSuccess('AI-generated content added to the chapter!');
        
        const currentTokens = parseInt(localStorage.getItem('tokenCount') || '0');
        const newTokens = currentTokens + Math.ceil(generatedContent.length / 4);
        localStorage.setItem('tokenCount', newTokens.toString());
        loadAIInfo();
        updateWordCount();
    } catch (error) {
        console.error("Error generating chapter content:", error);
        showError(`Error generating chapter content: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function getAIAssistance() {
    const apiKey = localStorage.getItem("openRouterApiKey");
    const selectedModel = localStorage.getItem("selectedModel") || "openai/gpt-3.5-turbo";
    const chapters = getChaptersContent();
    const lastChapterIndex = chapters.length - 1;
    const lastChapterContent = chapters[lastChapterIndex] || '';

    if (!apiKey) {
        showError("Please save a valid API key in the settings page.");
        return;
    }

    showLoading(true);

    try {
        const storyInfo = JSON.parse(localStorage.getItem('storyInfo') || '{}');
        const characters = JSON.parse(localStorage.getItem('characters') || '[]');
        const plot = JSON.parse(localStorage.getItem('plot') || '{}');

        const assistance = await generateAIAssistance(apiKey, selectedModel, lastChapterContent, lastChapterIndex + 1, storyInfo, characters, plot);
        
        if (lastChapterIndex >= 0) {
            const lastChapterTextarea = document.querySelector(`#chapters-container div:nth-child(${lastChapterIndex + 1}) textarea`);
            lastChapterTextarea.value += "\n\n" + assistance;
        } else {
            createChapterElement(1, assistance);
        }

        showSuccess('AI assistance added to your story!');
        
        const currentTokens = parseInt(localStorage.getItem('tokenCount') || '0');
        const newTokens = currentTokens + Math.ceil(assistance.length / 4);
        localStorage.setItem('tokenCount', newTokens.toString());
        loadAIInfo();
        updateWordCount();
    } catch (error) {
        console.error("Error getting AI assistance:", error);
        showError(`Error getting AI assistance: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function generateAIAssistance(apiKey, model, content, chapterNumber, storyInfo, characters, plot) {
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href,
        "X-Title": "Novel-Building Assistant"
    };

    let prompt = `You are a creative writing assistant specializing in ${storyInfo.genre} ${storyInfo.bookType}s. `;
    
    if (chapterNumber) {
        prompt += `Write Chapter ${chapterNumber} of the story based on the following information:\n\n`;
    } else {
        prompt += `Continue the story based on the following information:\n\n`;
    }

    prompt += `Genre: ${storyInfo.genre}\n`;
    prompt += `Book Type: ${storyInfo.bookType}\n\n`;

    prompt += "Characters:\n";
    characters.forEach(char => {
        prompt += `- ${char.name} (${char.role}): ${char.description}\n`;
    });
    prompt += "\n";

    prompt += `Plot Summary: ${plot.plotSummary}\n`;
    prompt += `Main Conflict: ${plot.mainConflict}\n`;
    prompt += `Key Plot Points: ${plot.plotPoints}\n`;
    prompt += `Climax: ${plot.climax}\n`;
    prompt += `Resolution: ${plot.resolution}\n\n`;

    prompt += `Current content:\n${content}\n\n`;
    prompt += "Please continue the story, developing the characters and advancing the plot. Write approximately 300-500 words.";

    const data = {
        model: model,
        messages: [
            { role: "system", content: "You are a creative writing assistant specializing in novel writing." },
            { role: "user", content: prompt }
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
        const totalSteps = 5;
        const currentStep = 5; // Writing Workspace is the final step
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
