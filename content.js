console.log("ESTOU NO CONTENT E FUNCIONANDO")
var classNameFields = {
    playButton: '//button[@data-testid="play-button"]',
    nextButton: 'mnipjT4SLDMgwiDCEnRC',
    randomButton: 'KVKoQ3u4JpKTvSSFtd6J',
    playListButton: 'Button-qlcn5g-0',
    accompanyButton: 'playback-bar__progress-time-elapsed',
    repeatButton: 'Vz6yjzttS0YlLcwrkoUR',
    saveToYourLibraryButton: 'control-button-heart',
    nameMusic: 'Q_174taY6n64ZGC3GsKj',
}

var objSpotify = {
    ONE_SECOND: '10',
    TIME_PLAY: '60',
    TIME_MIN_PAUSE: '2',
    TIME_MAX_PAUSE: '3',
    TIME_PAUSE: '30',
    TIME_MIN_NEXT_MUSIC: '20',
    TIME_MAX_NEXT_MUSIC: '60',
    TIME_NEXT_MUSIC: '60',
    TIME_MIN_PLAY_LIST: '5',
    TIME_MAX_PLAY_LIST: '8',
    PLAYLIST_END_TIME: '',
    PLAYLIST_PAUSE_TIME: '',
    MUSIC_END_TIME: '',
    LIST_TIMES: [],
    LAST_PLAY_LIST: [],
    LAST_TIME_RESTART: [],
    LIST_MUSIC: [],
    CHANGED_PLAYLIST: false,
    dados: '',
    lastTimer: '',
    countRepeat: 1,
    maxCountRepeat: 2
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "play-music":
            iniciarApi();
            break;
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "reset-player":
            window.location.reload();
            break;
    }
});


function iniciarApi() {


    chrome.storage.local.get(['tbDados'], function (result) {

        updateDados(result.tbDados)

        var timerMoment;
        var timerDailyPlay;
        var timerDailyPause;
        var timerDailyPausePlayList;
        var foundTrack = false;
        var currentMusic = '';

        playOnLoad();

        function playOnLoad() {
            document.body.style.backgroundColor = 'blue';
            console.log('iniciando...');
            playPlayList();
            timerInit();
            timerPlay();
        }

        function timerInit() {
            timerMoment = setInterval(function () {
                document.body.style.backgroundColor = 'green';
                funcLoop();
            }, objSpotify.ONE_SECOND);
        }

        function funcLoop() {
            setRandomActive();

            if (musicChanged() && probability(50)) {
                setSaveToYourLibrary();
            }

            if (timerIsPlay() == true) {
                setRepeatActive();
                console.log('Tocando');
                accompanyMusic();
                playListCurrent();
                playPlayList();
                playButton();
            } else {
                console.log('Em pause');
                stopButton();
            }

            timerPlayList();
            updateStorage();
        }

        ///Acompanha se a musica está tocando
        function accompanyMusic() {
            //*[@id="main"]/div/div[2]/div[3]/footer/div/div[2]/div/div[2]/div[1]

            var accompanyButtonXPath = "//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[2]/div/div[2]/div[1]";
            var accompanyButtonResult = document.evaluate(accompanyButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            var accompanyButtonElement = accompanyButtonResult.singleNodeValue;

            var accompanyButton = accompanyButtonElement.textContent;

            //const accompanyButton = document.getElementsByClassName(classNameFields.accompanyButton)[0];
            if (accompanyButton != undefined) {
                if (objSpotify.lastTimer == accompanyButton.innerText) {
                    objSpotify.countRepeat++;
                    nextMusic();
                }
                if (objSpotify.lastTimer == accompanyButton.innerText && objSpotify.countRepeat > objSpotify.maxCountRepeat) {
                    window.location.reload();
                }
                objSpotify.lastTimer = accompanyButton.innerText;
            }

            if (goNextMusic() == true) {
                console.log('Trocando musica: ' + new Date());
                updateStorage();
                nextMusic();
            }
        }

        ///vai para a playlista atual
        function playListCurrent() {
            var url = objSpotify.LIST_MUSIC[objSpotify.LAST_PLAY_LIST].PlayList;
            var urlcurrent = window.location.href;

            if (urlcurrent != url) {
                window.location.href = url;
            }
        }

        function setTimeRandonPause() {
            var idRandomPause = getRandomInt(
                convertMillisecondsToMinutes(objSpotify.TIME_MIN_PAUSE),
                convertMillisecondsToMinutes(objSpotify.TIME_MAX_PAUSE)
            );

            objSpotify.TIME_PAUSE = idRandomPause;
            console.log('setTimeRandonPause: ' + objSpotify.TIME_PAUSE)
            updateStorage();
        }

        function setTimeRandonNextMusic() {
            var idRandomNextMusic = getRandomInt(
                convertMillisecondsToMinutes(objSpotify.TIME_MIN_NEXT_MUSIC),
                convertMillisecondsToMinutes(objSpotify.TIME_MAX_NEXT_MUSIC)
            );

            objSpotify.TIME_NEXT_MUSIC = idRandomNextMusic;
            console.log('setTimeRandonNextMusic: ' + objSpotify.TIME_NEXT_MUSIC)
            updateStorage();
        }

        function timerPlay() {
            timerDailyPlay = setInterval(function () {
                console.log('Reiniciando ' + new Date());
                document.body.style.backgroundColor = 'red';
                stopButton();
                clearInterval(timerMoment);
                clearInterval(timerDailyPlay);
                timerPause();
            }, objSpotify.TIME_PLAY);
        }

        function timerPause() {
            console.log('Retomar ' + new Date());
            document.body.style.backgroundColor = 'green';
            window.location.reload();
        }

        function timerPausePlayList() {
            timerDailyPausePlayList = setInterval(function () {
                console.log('Retomar PlayList  ' + new Date());
                randomPlayList();
                timerInit();
                timerPlay();
                clearInterval(timerDailyPausePlayList);
            }, objSpotify.TIME_PAUSE);
        }

        ///Acompanha se a musica está tocando
        function nextMusic() {
            const nextButton = document.getElementsByClassName(classNameFields.nextButton)[0];
            if (nextButton != undefined) {
                nextButton.click();
            }
        }

        ///Verifica se a função randon está marcada  
        function setRandomActive() {
            //const randomButton = document.getElementsByClassName(classNameFields.randomButton)[0];

            let xpathExpression = "//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[2]/div/div[1]/div[1]/button[1]";
            let result = document.evaluate(xpathExpression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            let randomButton = result.singleNodeValue;
            if (randomButton != undefined) {
                if (randomButton.ariaChecked == "false") {
                    randomButton.click();
                }
            }
        }

        ///Verifica se a repeat randon está marcada  
        function setRepeatActive() {
            //let repeatButton = document.getElementsByClassName(classNameFields.repeatButton)[0];

            var repeatButtonXPath = "//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[2]/div/div[1]/div[2]/button[2]";
            var repeatButtonResult = document.evaluate(repeatButtonXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            var repeatButton = repeatButtonResult.singleNodeValue;
            if (repeatButton !== null) {
                var ariaLabel = repeatButton.getAttribute('aria-label');
                var ariaChecked = repeatButton.getAttribute('aria-checked');
                
                if (ariaChecked === "false" || ariaLabel === 'Não repetir' || ariaLabel === 'Repetir') {
                    repeatButton.click();
                }
            }
        }

        function setSaveToYourLibrary() {
            // if (window.location.href.includes("collection/tracks"))
            //     return;

            let saveToYourLibraryButton = getElementByXpath("//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[1]/div/button")
            var randomNumber = getRandomNumber(1, 100);
            console.log(randomNumber)

            if(randomNumber >= 50) {
                if (saveToYourLibraryButton != undefined) {
                    saveToYourLibraryButton.click();
                }
            }
        }

        function playButton() {
            let playButton = getElementByXpath("//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[2]/div/div[1]/button")

            //const playButton = getElementByXpath(classNameFields.playButton);
            if (playButton != undefined) {
                var title = playButton.getAttribute('aria-label');;
                if (title.indexOf('Tocar') >= 0 || title.indexOf('Play') >= 0 || title.indexOf('Reproduzir') >= 0)
                    playButton.click();
            }
        }

        function stopButton() {
            let playButton = getElementByXpath("//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[2]/div/div[1]/button")

            //const playButton = getElementByXpath(classNameFields.playButton);
            if (playButton != undefined) {
                var title = playButton.ariaLabel;
                if (title.indexOf('Pausar') >= 0 || title.indexOf('Pause') >= 0)
                    playButton.click();
            }
        }

        function playPlayList() {
            const playButton = getElementByXpath("//*[@id=\"main\"]/div/div[2]/div[4]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[2]/div[2]/div[4]/div/div/div/div/div/button")
            if (playButton != undefined) {
                var title = playButton.ariaLabel;
                if (title.indexOf('Tocar') >= 0 || title.indexOf('Play') >= 0)
                    playButton.click();
            }
        }

        function stopPlayList() {
            const playButton = getElementByXpath("//*[@id=\"main\"]/div/div[2]/div[4]/div[1]/div[2]/div[2]/div/div/div[2]/main/section/div/div[2]/div[2]/div[4]/div/div/div/div/div/button")
            if (playButton != undefined) {
                var title = playButton.ariaLabel;
                if (title.indexOf('Pausar') >= 0 || title.indexOf('Pause') >= 0)
                    playButton.click();
            }
        }

        ///vai para a proxima musica
        function goNextMusic() {
            if (objSpotify.MUSIC_END_TIME == '')
                objSpotify.MUSIC_END_TIME = new Date();

            if (new Date(objSpotify.MUSIC_END_TIME) <= new Date()) {
                setTimeRandonNextMusic();
                var dateNow = addMinutes(new Date(), objSpotify.TIME_NEXT_MUSIC);
                objSpotify.MUSIC_END_TIME = dateNow;
                console.log("NextMusic: " + dateNow);
                updateStorage();
                nextMusic();
                return true;
            }

            return false;
        }

        function timerPlayList() {
            if (foundTrack == false) {
                objSpotify.CHANGED_PLAYLIST = true;
                document.body.style.backgroundColor = 'red';
                stopButton();
            }
        }

        function timerIsPlay() {
            if (objSpotify.PLAYLIST_END_TIME == '')
                objSpotify.PLAYLIST_END_TIME = new Date();

            if (new Date() > new Date(objSpotify.PLAYLIST_END_TIME) &&
                new Date(objSpotify.PLAYLIST_END_TIME) < new Date(objSpotify.PLAYLIST_PAUSE_TIME) &&
                new Date(objSpotify.PLAYLIST_PAUSE_TIME) > new Date()) {
                foundTrack = false;
            }
            else if (new Date(objSpotify.PLAYLIST_END_TIME) <= new Date()) {
                let idRandomPlaylist = getRandomInt(
                    convertMillisecondsToMinutes(objSpotify.TIME_MIN_PLAY_LIST),
                    convertMillisecondsToMinutes(objSpotify.TIME_MAX_PLAY_LIST)
                );
                let dateNow = addMinutes(new Date(), idRandomPlaylist);
                objSpotify.PLAYLIST_END_TIME = dateNow;
                console.log("timerIsPlay: " + dateNow);

                setTimeRandonPause();
                objSpotify.PLAYLIST_PAUSE_TIME = addMinutes(dateNow, objSpotify.TIME_PAUSE);

                setTimeRandonNextMusic();
                objSpotify.MUSIC_END_TIME = addMinutes(new Date(), objSpotify.TIME_NEXT_MUSIC);

                foundTrack = true;
                updateStorage();
                randomPlayList();

            } else {
                foundTrack = true;
                goNextMusic();
            }

            return foundTrack;
        }

        function randomPlayList() {

            var idRandomPlaylist = getRandomInt(0, (objSpotify.LIST_MUSIC.length));
            objSpotify.LAST_PLAY_LIST = idRandomPlaylist;
            var url = objSpotify.LIST_MUSIC[objSpotify.LAST_PLAY_LIST].PlayList;
            objSpotify.CHANGED_PLAYLIST = true;
            console.log('trocando de playlist: ' + new Date());
            updateStorage(url);

        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function updateStorage(url) {
            if (objSpotify.MUSIC_END_TIME == undefined)
                objSpotify.MUSIC_END_TIME = '';

            var dados = JSON.stringify({
                TimeRefresh: objSpotify.ONE_SECOND / 1000,
                timePause: objSpotify.TIME_PAUSE,
                timePlay: convertMillisecondsToMinutes(objSpotify.TIME_PLAY),
                timeMinPause: convertMillisecondsToMinutes(objSpotify.TIME_MIN_PAUSE),
                timeMaxPause: convertMillisecondsToMinutes(objSpotify.TIME_MAX_PAUSE),
                timeMinNextMusic: convertMillisecondsToMinutes(objSpotify.TIME_MIN_NEXT_MUSIC),
                timeMaxNextMusic: convertMillisecondsToMinutes(objSpotify.TIME_MAX_NEXT_MUSIC),
                timeMinPlaylist: convertMillisecondsToMinutes(objSpotify.TIME_MIN_PLAY_LIST),
                timeMaxPlaylist: convertMillisecondsToMinutes(objSpotify.TIME_MAX_PLAY_LIST),
                listMusic: objSpotify.LIST_MUSIC,
                listTime: objSpotify.LIST_TIMES,
                lastTimeRestart: Date.now(),
                lastPlayList: objSpotify.LAST_PLAY_LIST,
                changedPlayList: objSpotify.CHANGED_PLAYLIST,
                lastTimer: objSpotify.lastTimer,
                playListEndTime: objSpotify.PLAYLIST_END_TIME.toString(),
                playListPauseTime: objSpotify.PLAYLIST_PAUSE_TIME.toString(),
                musicEndTime: objSpotify.MUSIC_END_TIME.toString(),
                timeNextMusic: objSpotify.TIME_NEXT_MUSIC
            });

            updateDados(dados);
            chrome.storage.local.set({ tbDados: dados }, function () {

                if (url)
                    window.location.href = url;
            });
        }

        function updateDados(dados) {
            objSpotify.dados = JSON.parse(dados)

            objSpotify.lastTimer = objSpotify.lastTimer;
            objSpotify.ONE_SECOND = objSpotify.dados.TimeRefresh * 1000;
            objSpotify.TIME_PLAY = convertMinutesToMilliseconds(objSpotify.dados.timePlay);
            objSpotify.TIME_MIN_PAUSE = convertMinutesToMilliseconds(objSpotify.dados.timeMinPause);
            objSpotify.TIME_MAX_PAUSE = convertMinutesToMilliseconds(objSpotify.dados.timeMaxPause);
            objSpotify.TIME_MIN_NEXT_MUSIC = convertMinutesToMilliseconds(objSpotify.dados.timeMinNextMusic);
            objSpotify.TIME_MAX_NEXT_MUSIC = convertMinutesToMilliseconds(objSpotify.dados.timeMaxNextMusic);
            objSpotify.TIME_MIN_PLAY_LIST = convertMinutesToMilliseconds(objSpotify.dados.timeMinPlaylist);
            objSpotify.TIME_MAX_PLAY_LIST = convertMinutesToMilliseconds(objSpotify.dados.timeMaxPlaylist);
            objSpotify.LIST_MUSIC = objSpotify.dados.listMusic;
            objSpotify.LIST_TIMES = objSpotify.dados.listTime;
            objSpotify.LAST_PLAY_LIST = objSpotify.dados.lastPlayList;
            objSpotify.LAST_TIME_RESTART = objSpotify.dados.lastTimeRestart;
            objSpotify.CHANGED_PLAYLIST = objSpotify.dados.changedPlayList;
            objSpotify.PLAYLIST_END_TIME = objSpotify.dados.playListEndTime;
            objSpotify.PLAYLIST_PAUSE_TIME = objSpotify.dados.playListPauseTime;
            objSpotify.MUSIC_END_TIME = objSpotify.dados.musicEndTime;
            objSpotify.TIME_NEXT_MUSIC = objSpotify.dados.timeNextMusic
        }

        function convertMinutesToMilliseconds(campo) {
            return campo * 60 * 1000;
        }

        function convertMillisecondsToMinutes(campo) {
            return campo / (1000 * 60);
        }

        function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        //Verifica se alterou a música
        function musicChanged() {
            // let nameMusic = document.getElementsByClassName(classNameFields.nameMusic)[0];
            // if (nameMusic && currentMusic != nameMusic.innerText) {
            //     currentMusic = nameMusic.innerText;
            //     return true;
            // }

            // return false;
        
            let nameMusicElement = getElementByXpath("//*[@id=\"main\"]/div/div[2]/div[3]/footer/div/div[1]/div/div[2]/div[1]/div/div/div/div/span/a")
            if (nameMusicElement && currentMusic !== nameMusicElement.textContent) {
                currentMusic = nameMusicElement.textContent;
                return true;
            }
        
            return false;
        }

        function probability(n) {
            return Math.random() < n / 100;
        }

        function getElementByXpath(path) {
            return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }

        function getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
    });
}

