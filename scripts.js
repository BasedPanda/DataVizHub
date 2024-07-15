document.addEventListener('DOMContentLoaded', function() {
    const apiEndpoint = 'https://datavizhub.clowderframework.org/api/datasets/66461b63e4b01d098f2777e6/files';
    const apiKey = '21335e14-10d2-4b97-8cdf-e661a4a7eee8';

    const gallery = document.getElementById('video-gallery');
    const searchInput = document.getElementById('search-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const closeModal = document.querySelector('.close');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');

    function fetchData() {
        loadingIndicator.style.display = 'block';
        fetch(apiEndpoint, {
            headers: {
                'X-API-Key': apiKey
            }
        })
        .then(response => {
            loadingIndicator.style.display = 'none';
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Error ${response.status}: ${text}`) });
            }
            return response.json();
        })
        .then(data => {
            console.log('API response data:', data); // Log the response data to inspect it
            gallery.innerHTML = '';
            data.forEach(item => {
                console.log('Item:', item); // Log each item to inspect its structure
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';

                const fileId = item.id;
                const fileUrl = `https://datavizhub.clowderframework.org/api/files/${fileId}/blob?key=${apiKey}`;
                const contentType = item.contentType;

                if (contentType.startsWith('image/')) {
                    // If the file is an image, use it directly
                    const img = document.createElement('img');
                    img.src = fileUrl;
                    img.alt = item.filename;
                    img.crossOrigin = "anonymous"; // Handle CORS
                    img.onerror = () => {
                        console.error(`Error loading image: ${fileUrl}`);
                    };
                    img.onload = () => {
                        console.log(`Successfully loaded image: ${fileUrl}`);
                    };
                    galleryItem.appendChild(img);
                } else if (contentType.startsWith('video/')) {
                    // If the file is a video, capture the midpoint frame
                    const video = document.createElement('video');
                    video.src = fileUrl;
                    video.muted = true;
                    video.crossOrigin = "anonymous"; // Handle CORS
                    video.preload = 'metadata'; // Ensure metadata is loaded
                    video.addEventListener('loadeddata', () => {
                        // Wait for the video metadata to be loaded
                        video.currentTime = video.duration / 2; // Seek to the midpoint of the video
                    });
                    video.addEventListener('seeked', () => {
                        // Capture the frame once the video has seeked to the midpoint
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const context = canvas.getContext('2d');
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const img = document.createElement('img');
                        img.src = canvas.toDataURL('image/jpeg');
                        img.alt = item.filename;
                        img.onerror = () => {
                            console.error(`Error loading video thumbnail: ${fileUrl}`);
                        };
                        img.onload = () => {
                            console.log(`Successfully loaded video thumbnail: ${fileUrl}`);
                        };
                        galleryItem.appendChild(img);
                        video.remove(); // Remove the video element after capturing the frame
                    });
                    video.onerror = () => {
                        console.error(`Error loading video: ${fileUrl}`);
                    };
                } else {
                    // For other file types, show a placeholder or file icon
                    const placeholder = document.createElement('div');
                    placeholder.textContent = 'Unsupported file type';
                    galleryItem.appendChild(placeholder);
                }

                const title = document.createElement('h3');
                title.textContent = item.filename;
                galleryItem.appendChild(title);

                gallery.appendChild(galleryItem);

                galleryItem.addEventListener('click', () => {
                    if (contentType.startsWith('video/')) {
                        // Display the modal with the selected video
                        modal.style.display = 'block';
                        modalVideo.src = fileUrl;
                        videoTitle.textContent = item.filename;
                        videoDescription.textContent = 'Description for ' + item.filename; // Placeholder for video description
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.style.display = 'block';
        });
    }

    closeModal.onclick = function() {
        modal.style.display = 'none';
        modalVideo.pause();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            modalVideo.pause();
        }
    }

    searchInput.addEventListener('input', function() {
        const query = searchInput.value.toLowerCase();
        const items = document.querySelectorAll('.gallery-item');

        items.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            if (title.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    fetchData();
});
