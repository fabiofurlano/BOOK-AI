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
    storyLanguageElement.textContent = `🌍 Language: ${selectedLanguage ? capitalizeFirstLetter(selectedLanguage) : "Not Selected"}`;
    storyGenreElement.textContent = `📚 Genre: ${selectedGenre ? capitalizeFirstLetter(selectedGenre) : "Not Selected"}`;
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

      storyLanguageElement.textContent = `🌍 Language: ${option.querySelector("label").textContent.trim()}`;
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

      storyGenreElement.textContent = `📚 Genre: ${option.querySelector("p").textContent.trim()}`;
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
    // Here you would typically navigate to the next page or start the novel building process
    console.log(
      `Starting novel with Language: ${selectedLanguage} and Genre: ${selectedGenre}`,
    );
  });

  // Initialize with default or previously selected language
  const initialLanguageOption = document.querySelector(
    `.language-option[data-language="${selectedLanguage}"]`,
  );
  if (initialLanguageOption) {
    initialLanguageOption.querySelector("img").classList.add("active");
    storyLanguageElement.textContent = `🌍 Language: ${initialLanguageOption.querySelector("label").textContent.trim()}`;
  }
  startButton.addEventListener("click", () => {
    // Save selected language and genre to localStorage
    localStorage.setItem("selectedLanguage", selectedLanguage);
    localStorage.setItem("selectedGenre", selectedGenre);

    // Navigate to the story-setting.html page
    window.location.href = "story-setting.html";
  });
  // Initialize with previously selected genre if available
  if (selectedGenre) {
    const initialGenreOption = document.querySelector(
      `.genre-option[data-genre="${selectedGenre}"]`,
    );
    if (initialGenreOption) {
      initialGenreOption.classList.add("active");
      storyGenreElement.textContent = `📚 Genre: ${initialGenreOption.querySelector("p").textContent.trim()}`;
    }
  }

  checkSelection();
});
