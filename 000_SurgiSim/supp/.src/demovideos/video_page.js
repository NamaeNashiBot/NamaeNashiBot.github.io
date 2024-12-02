document.querySelectorAll('.video-row video').forEach(video => {
    video.addEventListener('click', () => {
        const modal = document.getElementById('videoModal');
        const modalVideo = document.getElementById('modalVideo');
        
        modalVideo.src = video.src;
        modalVideo.currentTime = video.currentTime;
        modal.style.display = 'flex';

        modalVideo.play();
    });
});

const modal = document.getElementById('videoModal');
const modalClose = document.getElementById('modalClose');
const modalVideo = document.getElementById('modalVideo');

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
    modalVideo.pause();
    modalVideo.src = '';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modalClose.click();
    }
});
document.querySelectorAll('.video-row').forEach(row => {
    const videos = Array.from(row.querySelectorAll('video'));
    let maxDuration = 0;
    let loadedVideos = 0;

    videos.forEach(video => {
        video.addEventListener('loadedmetadata', () => {
            loadedVideos++;
            maxDuration = Math.max(maxDuration, video.duration);

            if (loadedVideos === videos.length) {
                videos.forEach(v => {
                    v.currentTime = 0;
                    v.play();
                });

                const longestVideo = videos.find(v => v.duration === maxDuration);
                longestVideo.addEventListener('ended', () => {
                    videos.forEach(v => {
                        v.pause();
                        v.currentTime = 0;
                    });
                    videos.forEach(v => v.play());
                });
            }
        });
    });
});
let intervalId = null; 
function checkWidth() {
    const warning = document.getElementById('widthWarning');
    const countdown = document.getElementById('countdown');
    
    if (window.innerWidth < 1000) { // less than 1080p portrait screen width
        warning.style.display = 'block';
        let seconds = 5;

        countdown.textContent = `This message will disappear in ${seconds} seconds.`;

        if (intervalId) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(() => {
            seconds--;
            countdown.textContent = `This message will disappear in ${seconds} seconds.`;

            if (seconds <= 0) {
                clearInterval(intervalId);
                intervalId = null;
                warning.style.display = 'none';
            }
        }, 1000);
    } else {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        warning.style.display = 'none';
    }
}

window.addEventListener('load', checkWidth);
window.addEventListener('resize', checkWidth);

function forceLoadVideos() {
    document.querySelectorAll('video').forEach(video => {
        video.load();
    });
}

window.addEventListener('load', forceLoadVideos);
document.addEventListener('DOMContentLoaded', forceLoadVideos);
