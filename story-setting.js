document.addEventListener('DOMContentLoaded', () => {
    const locationOptions = document.querySelectorAll('.location-option');
    const timelineOptions = document.querySelectorAll('.timeline-option');
    const nextButton = document.getElementById('next-button');

    let selectedLocation = null;
    let selectedTimeline = null;

    function updateNextButton() {
        nextButton.disabled = !(selectedLocation && selectedTimeline);
    }

    function selectOption(options, selectedOption) {
        options.forEach(option => {
            option.classList.remove('ring-2', 'ring-darkblue');
        });
        selectedOption.classList.add('ring-2', 'ring-darkblue');
    }

    locationOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedLocation = option.dataset.location;
            selectOption(locationOptions, option);
            updateNextButton();
        });
    });

    timelineOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedTimeline = option.dataset.timeline;
            selectOption(timelineOptions, option);
            updateNextButton();
        });
    });

    nextButton.addEventListener('click', () => {
        // Save selected options to localStorage
        localStorage.setItem('storyLocation', selectedLocation);
        localStorage.setItem('storyTimeline', selectedTimeline);

        // Navigate to the character development page
        window.location.href = 'character-development.html';
    });

    // Load previously selected options if they exist
    const savedLocation = localStorage.getItem('storyLocation');
    const savedTimeline = localStorage.getItem('storyTimeline');

    if (savedLocation) {
        const locationOption = document.querySelector(`[data-location="${savedLocation}"]`);
        if (locationOption) {
            selectedLocation = savedLocation;
            selectOption(locationOptions, locationOption);
        }
    }

    if (savedTimeline) {
        const timelineOption = document.querySelector(`[data-timeline="${savedTimeline}"]`);
        if (timelineOption) {
            selectedTimeline = savedTimeline;
            selectOption(timelineOptions, timelineOption);
        }
    }

    updateNextButton();
});