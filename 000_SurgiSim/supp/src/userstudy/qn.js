function getPageNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 0;
    return page;
}

function setVideoSources(page) {
    const basePath = 'res_for_qn/' + page + '/';

    // Video file names for videos 1-4
    const videoFiles = ['guide.mp4', 'jelly.mp4', 'ply.mp4', 'mesh.mp4'];

    // Re-ID mapping for videos 1-4
    const reidMapping = {
        1: [0, 1, 2, 3],
        2: [1, 0, 3, 2],
        3: [2, 3, 0, 1],
        4: [3, 2, 1, 0],
        5: [0, 2, 1, 3],
        6: [1, 3, 2, 0],
        7: [2, 0, 3, 1],
        8: [3, 1, 0, 2],
        9: [0, 3, 1, 2],
        // No mapping needed for page 10
    };

    const reid = reidMapping[page];

    if (reid) {
        document.getElementById('video1').src = basePath + videoFiles[reid[0]];
        document.getElementById('video2').src = basePath + videoFiles[reid[1]];
        document.getElementById('video3').src = basePath + videoFiles[reid[2]];
        document.getElementById('video4').src = basePath + videoFiles[reid[3]];
    }

    // Swap mapping for videos 5 and 6 with 1/2 probability
    const swapMapping = {
        1: true,
        2: false,
        3: true,
        4: false,
        5: true,
        6: false,
        7: true,
        8: false,
        9: true,
        // No swap needed for page 10
    };

    const shouldSwap = swapMapping[page];

    if (shouldSwap !== undefined) {
        if (shouldSwap) {
            document.getElementById('video5').src = basePath + 'fix.mp4';
            document.getElementById('video6').src = basePath + 'guide.mp4';
        } else {
            document.getElementById('video5').src = basePath + 'guide.mp4';
            document.getElementById('video6').src = basePath + 'fix.mp4';
        }
    }
}

function setPageTitle(page) {
    document.getElementById('pageTitle').innerText = 'Set ' + page;
}

function setupNavigationButtons(page) {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    if (page <= 1) {
        prevButton.disabled = true;
    } else {
        prevButton.disabled = false;
        prevButton.onclick = function () {
            window.location.href = '?page=' + (page - 1);
        };
    }

    if (page >= 10) {
        nextButton.disabled = true;
    } else {
        nextButton.disabled = false;
        nextButton.onclick = function () {
            window.location.href = '?page=' + (page + 1);
        };
    }
}

function waitForVideosAndPlay() {
    const videosFirstSet = [
        document.getElementById('video1'),
        document.getElementById('video2'),
        document.getElementById('video3'),
        document.getElementById('video4'),
    ];

    const allVideos = [
        ...videosFirstSet,
        document.getElementById('video5'),
        document.getElementById('video6'),
    ];

    const replayButtons = document.getElementsByClassName('replayButton');
    Array.from(replayButtons).forEach(function (button) {
        button.onclick = function () {
            resetAndPlayAllVideos(allVideos);
        };
    });
}

function resetAndPlayAllVideos(videos) {
    videos.forEach(function (video) {
        video.pause();
        video.currentTime = 0;
    });
    videos.forEach(function (video) {
        video.play();
    });
}

window.onload = function () {
    const page = getPageNumber();

    if (page === 0) {
        document.getElementById('startContainer').classList.remove('hidden');
        document.getElementById('navigationButtons').classList.add('hidden');
        document.getElementById('part1Title').classList.add('hidden');
        document.getElementById('part1Videos').classList.add('hidden');
        document.getElementById('separator').classList.add('hidden');
        document.getElementById('part2Title').classList.add('hidden');
        document.getElementById('part2Videos').classList.add('hidden');
        document.getElementById('replayButtonContainer').classList.add('hidden');
        document.getElementById('pageInfo').innerText = 'You are participating in a surgical simulation quality user study. Please confirm that you understand the information. Each set of videos lasts 8 seconds and is divided into two parts, each corresponding to a question in the questionnaire. Please watch the full 8 seconds before making a choice. If you wish to replay, you can click the blue Play button at the top of the page. This questionnaire is expected to take 3-5 minutes. Thank you for your participation!';
        document.getElementById('pageTitle').innerText = 'Surgical Simulation Quality User Study';

        document.getElementById('startButton').onclick = function () {
            window.location.href = '?page=1';
        };
    } else if (page === 10) {
        document.getElementById('startContainer').classList.add('hidden');
        document.getElementById('navigationButtons').classList.add('hidden');
        document.getElementById('part1Title').classList.add('hidden');
        document.getElementById('part1Videos').classList.add('hidden');
        document.getElementById('separator').classList.add('hidden');
        document.getElementById('part2Title').classList.add('hidden');
        document.getElementById('part2Videos').classList.add('hidden');
        document.getElementById('replayButtonContainer').classList.add('hidden');
        document.getElementById('pageInfo').classList.remove('hidden');
        document.getElementById('pageInfo').innerText = 'If you have any questions, please contact the person you get the link from.';
        document.getElementById('pageTitle').innerText = 'Thank you for your participation!';

        setupNavigationButtons(page);
    } else {
        document.getElementById('startContainer').classList.add('hidden');
        document.getElementById('navigationButtons').classList.remove('hidden');
        document.getElementById('part1Title').classList.remove('hidden');
        document.getElementById('part1Videos').classList.remove('hidden');
        document.getElementById('separator').classList.remove('hidden');
        document.getElementById('part2Title').classList.remove('hidden');
        document.getElementById('part2Videos').classList.remove('hidden');
        document.getElementById('replayButtonContainer').classList.remove('hidden');
        document.getElementById('pageInfo').classList.add('hidden');

        setPageTitle(page);
        setVideoSources(page);
        setupNavigationButtons(page);
        waitForVideosAndPlay();
        resetAndPlayAllVideos([
            document.getElementById('video1'),
            document.getElementById('video2'),
            document.getElementById('video3'),
            document.getElementById('video4'),
            document.getElementById('video5'),
            document.getElementById('video6'),
        ]);
    }
};