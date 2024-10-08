document.addEventListener("DOMContentLoaded", () => {
  const locationOptions = document.querySelectorAll(".location-option");
  const timelineOptions = document.querySelectorAll(".timeline-option");
  const nextButton = document.getElementById("next-button");
  const guidanceMessage = document.getElementById("guidance-message");
  
  // Use querySelector for more robust selection
  const storyLanguageElement = document.querySelector("#story-language");
  const storyGenreElement = document.querySelector("#story-genre");
  const storySettingElement = document.querySelector("#story-location");
  const storyTimelineElement = document.querySelector("#story-timeline");

  let selectedLocation = localStorage.getItem("selectedLocation") || null;
  let selectedTimeline = localStorage.getItem("selectedTimeline") || null;
  let selectedLanguage = localStorage.getItem("selectedLanguage") || "Not Selected";
  let selectedGenre = localStorage.getItem("selectedGenre") || "Not Selected";

  function loadStoryElements() {
    console.log("Loading story elements");
    updateSidebar();
  }

  function updateSidebar() {
    console.log("Updating sidebar");
    updateElement(storyLanguageElement, "story-language", `🌍 Language: ${selectedLanguage}`);
    updateElement(storyGenreElement, "story-genre", `📚 Genre: ${selectedGenre}`);
    updateElement(storySettingElement, "story-location", `🏙️ Location: ${selectedLocation || "Not Selected"}`);
    updateElement(storyTimelineElement, "story-timeline", `🕰️ Timeline: ${selectedTimeline || "Not Selected"}`);
  }

  function updateElement(element, elementId, content) {
    if (element) {
      element.textContent = content;
    } else {
      console.error(`Element with id '${elementId}' not found`);
    }
  }

  loadStoryElements();

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
    console.log("Entering selectOption function");
    options.forEach((option) => {
      option.classList.remove("ring-2", "ring-darkblue");
    });
    selectedOption.classList.add("ring-2", "ring-darkblue");
    const optionText = selectedOption.querySelector("p").textContent;
    elementToUpdate.textContent = `${emoji} ${elementToUpdate.id.split("-")[1].charAt(0).toUpperCase() + elementToUpdate.id.split("-")[1].slice(1)}: ${optionText}`;
  }

  function dispatchStoryElementEvent(elementType, value) {
    console.log(`Dispatching event: ${elementType} = ${value}`);
    const event = new CustomEvent("storyElementUpdated", {
      detail: { type: elementType, value: value },
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(event);
  }

  // Wrap event listeners in DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    locationOptions.forEach((option) => {
      option.addEventListener("click", () => {
        selectedLocation = option.dataset.location;
        selectOption(locationOptions, option, storySettingElement, "🏙️");
        localStorage.setItem("selectedLocation", selectedLocation);
        dispatchStoryElementEvent("location", selectedLocation);
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
        localStorage.setItem("selectedTimeline", selectedTimeline);
        dispatchStoryElementEvent("timeline", selectedTimeline);
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
      window.location.href = "character_setup.html";
    });

    // Listen for story element updates
    document.addEventListener("storyElementUpdated", (event) => {
      console.log("Received storyElementUpdated event:", event.detail);
      const { type, value } = event.detail;
      switch(type) {
        case "language":
          selectedLanguage = value;
          break;
        case "genre":
          selectedGenre = value;
          break;
        case "location":
          selectedLocation = value;
          break;
        case "timeline":
          selectedTimeline = value;
          break;
      }
      updateSidebar();
    });
  });

  updateNextButton();
  console.log("story-setting.js fully loaded");
});
