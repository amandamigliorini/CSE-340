'use strict';

// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('favorite-add').addEventListener('click', (event) => {
//         event.preventDefault();
//         const invId = event.currentTarget.closest('.detail-title').getAttribute('data-id');
//         window.location.href = `/inv/favorites/handleFavorite/${invId}`;
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('favorite-add').addEventListener('click', async (event) => {
        event.preventDefault();
        const invId = event.currentTarget.closest('.detail-title').getAttribute('data-id');
        
        try {
            const response = await fetch(`/inv/favorites/handleFavorite/${invId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                window.location.href = `/inv/detail/${invId}`;
            } else {
                console.error('Failed to update favorite');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});