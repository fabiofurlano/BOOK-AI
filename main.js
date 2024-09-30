document.addEventListener('DOMContentLoaded', () => {
    const languageOptions = document.querySelectorAll('input[name="language"]');
    const genreOptions = document.querySelectorAll('.genre-option');
    const bookTypeOptions = document.querySelectorAll('.book-type-option');
    const startButton = document.getElementById('start-button');
    
    let selectedLanguage = 'en';
    let selectedGenre = '';
    let selectedBookType = '';

    languageOptions.forEach(option => {
        option.addEventListener('change', () => {
            selectedLanguage = option.value;
            checkSelection();
        });
    });

    genreOptions.forEach(option => {
        option.addEventListener('click', () => {
            genreOptions.forEach(opt => opt.classList.remove('ring-2', 'ring-purple-500'));
            option.classList.add('ring-2', 'ring-purple-500');
            selectedGenre = option.dataset.genre;
            checkSelection();
        });
    });

    bookTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            bookTypeOptions.forEach(opt => opt.classList.remove('ring-2', 'ring-purple-500'));
            option.classList.add('ring-2', 'ring-purple-500');
            selectedBookType = option.dataset.type;
            checkSelection();
        });
    });

    function checkSelection() {
        if (selectedLanguage && selectedGenre && selectedBookType) {
            startButton.disabled = false;
        } else {
            startButton.disabled = true;
        }
    }

    startButton.addEventListener('click', () => {
        if (selectedLanguage && selectedGenre && selectedBookType) {
            const storyInfo = {
                language: selectedLanguage,
                genre: selectedGenre,
                bookType: selectedBookType
            };
            localStorage.setItem('storyInfo', JSON.stringify(storyInfo));
            window.location.href = 'character-development.html';
        }
    });
});
