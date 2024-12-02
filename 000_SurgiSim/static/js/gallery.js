function display(id) {
    var target = document.getElementById(id);
    if (target.style.display == "none") {
        target.style.display = "";
    } else {
        target.style.display = "none";
    }
}

window.onload = function () {
    const FolderUrl = 'supp/src/demovideos/media/';
    const jsonFileUrl = 'static/js/videos.json';

    fetch(jsonFileUrl)
        .then(response => response.json())
        .then(data => {
            const mediaFiles = data.videos;
            
            const gallery = document.querySelector('.gallery');
            mediaFiles.forEach(file => {
                const fileType = file.split('.').pop().toLowerCase();
                if (['mp4', 'webm', 'ogg'].includes(fileType)) {
                    const video = document.createElement('video');
                    video.src = FolderUrl + file;
                    video.controls = false;
                    video.loop = true;
                    video.muted = true;
                    video.autoplay = true;
                    video.setAttribute('onclick', `openLightbox('${video.src}', 'video')`);
                    gallery.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = FolderUrl + file;
                    img.setAttribute('onclick', `openLightbox('${img.src}', 'image')`);
                    gallery.appendChild(img);
                }
            });

            $(document).ready(function () {
                let autoPlayTimeout;
                $('.gallery').slick({
                    infinite: true,
                    slidesToShow: 4,
                    slidesToScroll: 3,
                    autoplay: true,
                    autoplaySpeed: 5000,
                    arrows: true,
                    dots: true,
                    draggable: true,
                    prevArrow: '<button type="button" class="slick-prev custom-arrow"> </button>',
                    nextArrow: '<button type="button" class="slick-next custom-arrow"> </button>' 
                });
                function pauseAndResumeAutoPlay() {
                    $('.gallery').slick('slickPause');
                    clearTimeout(autoPlayTimeout);
                    autoPlayTimeout = setTimeout(() => {
                        $('.gallery').slick('slickPlay');
                    }, 8000);
                }
                $('.gallery-arrows .slick-prev, .gallery-arrows .slick-next').on('click', pauseAndResumeAutoPlay);
                $('.gallery').on('swipe', pauseAndResumeAutoPlay);
                $('.gallery').on('click', '.slick-dots li', pauseAndResumeAutoPlay);
            });
        })
        
        .catch(error => {
            console.error('Error fetching the file list:', error);
        });
};

function openLightbox(src, type) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');

    if (type === 'video') {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = src;
        lightboxVideo.play();
    } else {
        lightboxVideo.style.display = 'none';
        lightboxImg.style.display = 'block';
        lightboxImg.src = src;
    }

    lightbox.style.display = 'flex';

    lightbox.addEventListener('click', function (event) {
        if (event.target.tagName !== 'IMG' && event.target.tagName !== 'VIDEO') {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxVideo = document.getElementById('lightbox-video');
    lightbox.style.display = 'none';
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = '';
    }
}
