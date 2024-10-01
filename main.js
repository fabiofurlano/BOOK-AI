document.addEventListener('DOMContentLoaded', () => {
    const languageOptions = document.querySelectorAll('input[name="language"]');
    const genreOptions = document.querySelectorAll('.genre-option');
    const startButton = document.getElementById('start-button');
    
    let selectedLanguage = 'en';
    let selectedGenre = '';

    languageOptions.forEach(option => {
        option.addEventListener('change', () => {
            selectedLanguage = option.value;
            checkSelection();
        });
    });

    genreOptions.forEach(option => {
        option.addEventListener('click', () => {
            genreOptions.forEach(opt => opt.classList.remove('ring-2', 'ring-darkblue'));
            option.classList.add('ring-2', 'ring-darkblue');
            selectedGenre = option.dataset.genre;
            checkSelection();
        });
    });

    function checkSelection() {
        if (selectedLanguage && selectedGenre) {
            startButton.disabled = false;
            startButton.classList.remove('opacity-50', 'cursor-not-allowed');
            startButton.classList.add('hover:shadow-xl');
        } else {
            startButton.disabled = true;
            startButton.classList.add('opacity-50', 'cursor-not-allowed');
            startButton.classList.remove('hover:shadow-xl');
        }
    }

    startButton.addEventListener('click', () => {
        if (selectedLanguage && selectedGenre) {
            const storyInfo = {
                language: selectedLanguage,
                genre: selectedGenre
            };
            localStorage.setItem('storyInfo', JSON.stringify(storyInfo));
            window.location.href = 'story-setting.html';
        }
    });

    // Initialize button state
    checkSelection();
});
