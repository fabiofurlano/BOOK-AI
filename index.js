document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const languageOptions = document.querySelectorAll(".language-option");
  const genreOptions = document.querySelectorAll(".genre-option");
  const storyLanguageElement = document.getElementById("story-language");
  const storyGenreElement = document.getElementById("story-genre");
  const guidanceMessage = document.getElementById("guidance-message");
  let selectedLanguage = localStorage.getItem("selectedLanguage") || "en";
  let selectedGenre = localStorage.getItem("selectedGenre") || null;

  function checkSelection() {
    if (selectedLanguage && selectedGenre) {
      startButton.disabled = false;
      guidanceMessage.textContent =
        "You're ready to start building your novel!";
      guidanceMessage.classList.remove("text-gray-500");
      guidanceMessage.classList.add("text-green-500");
    } else {
      startButton.disabled = true;
      guidanceMessage.textContent =
        "Please select a language and genre to begin building your novel.";
      guidanceMessage.classList.remove("text-green-500");
      guidanceMessage.classList.add("text-gray-500");
    }

    // Update Sidebar with current selections
    updateSidebar();
  }

  function updateSidebar() {
    storyLanguageElement.textContent = `🌍 Language: ${selectedLanguage ? capitalizeFirstLetter(selectedLanguage) : "Not Selected"}`;
    storyGenreElement.textContent = `📚 Genre: ${selectedGenre ? capitalizeFirstLetter(selectedGenre) : "Not Selected"}`;
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function dispatchStoryElementEvent(elementType, value) {
    const event = new CustomEvent("storyElementUpdated", {
      detail: { type: elementType, value: value },
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(event);
  }

  languageOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const languageValue = option.dataset.language;
      const radioInput = option.querySelector('input[type="radio"]');
      radioInput.checked = true;
      selectedLanguage = languageValue;

      // Store selected language in local storage
      localStorage.setItem("selectedLanguage", selectedLanguage);

      languageOptions.forEach((opt) =>
        opt.querySelector("img").classList.remove("active"),
      );
      option.querySelector("img").classList.add("active");

      dispatchStoryElementEvent("language", selectedLanguage);
      checkSelection();
    });
  });

  genreOptions.forEach((option) => {
    option.addEventListener("click", () => {
      genreOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      selectedGenre = option.dataset.genre;

      // Store selected genre in local storage
      localStorage.setItem("selectedGenre", selectedGenre);

      dispatchStoryElementEvent("genre", selectedGenre);
      checkSelection();
    });

    // Add tooltip functionality
    option.addEventListener("mouseover", () => {
      option.querySelector(".tooltip").classList.remove("hidden");
    });
    option.addEventListener("mouseout", () => {
      option.querySelector(".tooltip").classList.add("hidden");
    });
  });

  startButton.addEventListener("click", () => {
    // Navigate to the story-setting.html page
    window.location.href = "story-setting.html";
  });

  // Initialize with default or previously selected language
  const initialLanguageOption = document.querySelector(
    `.language-option[data-language="${selectedLanguage}"]`,
  );
  if (initialLanguageOption) {
    initialLanguageOption.querySelector("img").classList.add("active");
    dispatchStoryElementEvent("language", selectedLanguage);
  }

  // Initialize with previously selected genre if available
  if (selectedGenre) {
    const initialGenreOption = document.querySelector(
      `.genre-option[data-genre="${selectedGenre}"]`,
    );
    if (initialGenreOption) {
      initialGenreOption.classList.add("active");
      dispatchStoryElementEvent("genre", selectedGenre);
    }
  }

  // Listen for story element updates
  document.addEventListener("storyElementUpdated", (event) => {
    const { type, value } = event.detail;
    if (type === "language") {
      selectedLanguage = value;
    } else if (type === "genre") {
      selectedGenre = value;
    }
    updateSidebar();
  });

  checkSelection();
});
