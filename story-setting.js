document.addEventListener("DOMContentLoaded", () => {
  const locationOptions = document.querySelectorAll(".location-option");
  const timelineOptions = document.querySelectorAll(".timeline-option");
  const nextButton = document.getElementById("next-button");
  const guidanceMessage = document.getElementById("guidance-message");
  const storyLanguageElement = document.getElementById("story-language");
  const storyGenreElement = document.getElementById("story-genre");
  const storySettingElement = document.getElementById("story-setting");
  const storyTimelineElement = document.getElementById("story-timeline");

  let selectedLocation = localStorage.getItem("storyLocation") || null;
  let selectedTimeline = localStorage.getItem("storyTimeline") || null;

  // Load previously selected language and genre
  const selectedLanguage = localStorage.getItem("selectedLanguage");
  const selectedGenre = localStorage.getItem("selectedGenre");

  if (selectedLanguage) {
    storyLanguageElement.textContent = `🌍 Language: ${selectedLanguage}`;
  }
  if (selectedGenre) {
    storyGenreElement.textContent = `📚 Genre: ${selectedGenre}`;
  }

  function updateNextButton() {
    nextButton.disabled = !(selectedLocation && selectedTimeline);
    if (selectedLocation && selectedTimeline) {
      guidanceMessage.textContent =
        "You're ready to move on to character development!";
      guidanceMessage.classList.remove("text-gray-500");
      guidanceMessage.classList.add("text-green-500");
    } else {
      guidanceMessage.textContent =
        "Please select a location and timeline for your story.";
      guidanceMessage.classList.remove("text-green-500");
      guidanceMessage.classList.add("text-gray-500");
    }
  }

  function selectOption(options, selectedOption, elementToUpdate, emoji) {
    options.forEach((option) => {
      option.classList.remove("ring-2", "ring-darkblue");
    });
    selectedOption.classList.add("ring-2", "ring-darkblue");
    elementToUpdate.textContent = `${emoji} ${elementToUpdate.id.split("-")[1].charAt(0).toUpperCase() + elementToUpdate.id.split("-")[1].slice(1)}: ${selectedOption.querySelector("p").textContent}`;
  }

  locationOptions.forEach((option) => {
    option.addEventListener("click", () => {
      selectedLocation = option.dataset.location;
      selectOption(locationOptions, option, storySettingElement, "🏙️");
      updateNextButton();
    });

    // Add tooltip functionality
    option.addEventListener("mouseover", () => {
      option.querySelector(".tooltip").classList.remove("hidden");
    });
    option.addEventListener("mouseout", () => {
      option.querySelector(".tooltip").classList.add("hidden");
    });
  });

  timelineOptions.forEach((option) => {
    option.addEventListener("click", () => {
      selectedTimeline = option.dataset.timeline;
      selectOption(timelineOptions, option, storyTimelineElement, "🕰️");
      updateNextButton();
    });

    // Add tooltip functionality
    option.addEventListener("mouseover", () => {
      option.querySelector(".tooltip").classList.remove("hidden");
    });
    option.addEventListener("mouseout", () => {
      option.querySelector(".tooltip").classList.add("hidden");
    });
  });

  nextButton.addEventListener("click", () => {
    localStorage.setItem("storyLocation", selectedLocation);
    localStorage.setItem("storyTimeline", selectedTimeline);
    window.location.href = "character-development.html";
  });

  // Initialize with saved values if they exist
  if (selectedLocation) {
    const locationOption = document.querySelector(
      `[data-location="${selectedLocation}"]`,
    );
    if (locationOption) {
      selectOption(locationOptions, locationOption, storySettingElement, "🏙️");
    }
  }
  if (selectedTimeline) {
    const timelineOption = document.querySelector(
      `[data-timeline="${selectedTimeline}"]`,
    );
    if (timelineOption) {
      selectOption(timelineOptions, timelineOption, storyTimelineElement, "🕰️");
    }
  }

  updateNextButton();
});
