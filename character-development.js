document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    const roleOptions = document.querySelectorAll('.role-option');
    const addCharacterButton = document.getElementById('add-character');
    const generateCharacterButton = document.getElementById('generate-character');
    const nextStepButton = document.getElementById('next-step');

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(el => el.classList.remove('selected', 'ring-2', 'ring-darkblue'));
            option.classList.add('selected', 'ring-2', 'ring-darkblue');
            console.log('Selected role:', option.dataset.role);
        });
    });

    if (addCharacterButton) {
        addCharacterButton.addEventListener('click', addCharacter);
        console.log('"Add Character" button listener added');
    } else {
        console.error('"Add Character" button not found');
    }

    if (generateCharacterButton) {
        generateCharacterButton.addEventListener('click', generateCharacterWithAI);
        console.log('"Generate with AI" button listener added');
    } else {
        console.error('"Generate with AI" button not found');
    }

    if (nextStepButton) {
        nextStepButton.addEventListener('click', () => {
            window.location.href = 'plot-development.html';
        });
        console.log('"Next: Plot Development" button listener added');
    } else {
        console.error('"Next: Plot Development" button not found');
    }

    loadCharacters();
    updateProgressBar();
});

function addCharacter() {
    console.log('addCharacter function called');
    const name = document.getElementById('character-name').value;
    const role = document.querySelector('.role-option.selected')?.dataset.role;
    const age = document.getElementById('character-age').value;
    const appearance = document.getElementById('character-appearance').value;
    const background = document.getElementById('character-background').value;
    const personality = document.getElementById('character-personality').value;
    const goals = document.getElementById('character-goals').value;
    const motivation = document.getElementById('character-motivation').value;

    if (!name || !role || !age || !appearance || !background || !personality || !goals || !motivation) {
        showError('Please fill in all fields and select a role.');
        return;
    }

    const character = { name, role, age, appearance, background, personality, goals, motivation };
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    characters.push(character);
    localStorage.setItem('characters', JSON.stringify(characters));

    displayCharacter(character);
    clearForm();
    console.log('Character added:', character);
}

function displayCharacter(character) {
    const characterList = document.getElementById('characters');
    const characterItem = document.createElement('li');
    characterItem.className = 'bg-white p-4 rounded-lg shadow mb-4';
    characterItem.innerHTML = `
        <div class="flex items-start">
            <div class="flex-grow">
                <h3 class="text-xl font-semibold">${character.name} (${character.role})</h3>
                <p><strong>Age:</strong> ${character.age}</p>
                <p><strong>Appearance:</strong> ${character.appearance}</p>
                <p><strong>Background:</strong> ${character.background}</p>
                <p><strong>Personality:</strong> ${character.personality}</p>
                <p><strong>Goals:</strong> ${character.goals}</p>
                <p><strong>Motivation:</strong> ${character.motivation}</p>
            </div>
            <button class="delete-character text-red-500 hover:text-red-700" data-name="${character.name}">Delete</button>
        </div>
    `;
    characterList.appendChild(characterItem);

    characterItem.querySelector('.delete-character').addEventListener('click', (e) => {
        deleteCharacter(e.target.dataset.name);
        characterItem.remove();
    });
}

function deleteCharacter(name) {
    let characters = JSON.parse(localStorage.getItem('characters') || '[]');
    characters = characters.filter(char => char.name !== name);
    localStorage.setItem('characters', JSON.stringify(characters));
}

function loadCharacters() {
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    characters.forEach(displayCharacter);
}

function clearForm() {
    document.getElementById('character-name').value = '';
    document.getElementById('character-age').value = '';
    document.getElementById('character-appearance').value = '';
    document.getElementById('character-background').value = '';
    document.getElementById('character-personality').value = '';
    document.getElementById('character-goals').value = '';
    document.getElementById('character-motivation').value = '';
    document.querySelectorAll('.role-option').forEach(el => el.classList.remove('selected', 'ring-2', 'ring-darkblue'));
}

async function generateCharacterWithAI() {
    console.log('generateCharacterWithAI function called');
    const apiKey = localStorage.getItem("openRouterApiKey");
    const selectedRole = document.querySelector('.role-option.selected')?.dataset.role;
    const selectedModel = localStorage.getItem("selectedModel") || "openai/gpt-3.5-turbo";

    console.log("Starting character generation process");
    console.log("API Key (first 5 chars):", apiKey ? apiKey.substring(0, 5) + "..." : "Not found");
    console.log("Selected role:", selectedRole);
    console.log("Selected model:", selectedModel);

    if (!apiKey) {
        showError("Please save a valid API key in the settings page.");
        return;
    }

    if (!selectedRole) {
        showError("Please select a character role.");
        return;
    }

    showLoading(true);

    try {
        console.log("Generating character details...");
        const characterDetails = await generateCharacterDetails(apiKey, selectedRole, selectedModel);
        console.log("Character details generated:", characterDetails);

        document.getElementById('character-name').value = characterDetails.name;
        document.getElementById('character-age').value = characterDetails.age;
        document.getElementById('character-appearance').value = characterDetails.appearance;
        document.getElementById('character-background').value = characterDetails.background;
        document.getElementById('character-personality').value = characterDetails.personality;
        document.getElementById('character-goals').value = characterDetails.goals;
        document.getElementById('character-motivation').value = characterDetails.motivation;

        showSuccess('Character generated successfully!');
    } catch (error) {
        console.error("Error generating character:", error);
        showError(`Error generating character: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

async function generateCharacterDetails(apiKey, role, model) {
    console.log("Entering generateCharacterDetails function");
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
            { role: "system", content: "You are a creative writing assistant specializing in character development. Respond with a JSON object containing name, age, appearance, background, personality, goals, and motivation keys." },
            { role: "user", content: `Generate a detailed character profile for a ${role} in a novel. Include a name, age, appearance, background, personality traits, goals, and their primary motivation.` }
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
        throw new Error(`Character generation failed: ${errorData.error || response.statusText}`);
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
            console.log("Parsed character details:", parsedContent);
            return parsedContent;
        } else {
            throw new Error("No valid JSON found in the response");
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error("Failed to parse character details. Please try again.");
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const totalSteps = 5;
        const currentStep = 3; // Character Development is now the third step
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
