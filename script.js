
   let localPlaylistData = {};

fetch('data.json')
  .then(r => r.json())
  .then(data => {
    localPlaylistData = data;
    console.log(data);
    fetchTrackTitle(); // update title after data loads
  });


// ... rest of your script stays same ...
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('clockDisplay').innerText = `${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    
    // Fisher-Yates algoriyhm to shuffle an array
    function shufflePlaylist(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    
    // Separate copies so shuffling doesn't mutate original
    const shuffledPlaylist1 = [...originalPlaylist1];
    shufflePlaylist(shuffledPlaylist1);
    const shuffledPlaylist2 = [...originalPlaylist2];
    shufflePlaylist(shuffledPlaylist2);
    const shuffledPlaylist3 = [...originalPlaylist3];
    shufflePlaylist(shuffledPlaylist3);

    let isShuffleOn = false;    
    let selectedDecade = '80s';
    let activeList = originalPlaylist1;

    function getCurrentPlaylist() {
      return activeList;
    } 
 
  
        
    let currentIndex = 0;    
    let ytPlayer;
    let isAudioMuted = true;

    
    function onYouTubeIframeAPIReady() {
      const activeList = getCurrentPlaylist();
      ytPlayer = new YT.Player('player', {
        height: '1',
        width: '1',
        videoId: activeList[currentIndex],
        playerVars: { 
          'autoplay': 1,
          'mute': 1,
          'controls': 0,
          'playsinline': 1
        },
        events: {
          'onReady': function(event) {
            event.target.mute();
            event.target.setVolume(50);
            updateMuteUI();
            updateUI();
          },
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    }    

    document.addEventListener('click', function unmuteOnFirstClick(e) {
      if (e.target.closest('#muteBtn')) return;
      if (isAudioMuted) {
        isAudioMuted = false;
        if (ytPlayer && typeof ytPlayer.unMute === 'function') {
          ytPlayer.unMute();
          ytPlayer.setVolume(100);
        }
        updateMuteUI();
      }
    }, { once: true });


 

    document.addEventListener('DOMContentLoaded', function() {
      const muteBtn = document.getElementById('muteBtn');
      if (muteBtn) {
        muteBtn.addEventListener('click', function() {
          isAudioMuted = !isAudioMuted;
          if (ytPlayer && typeof ytPlayer.unMute === 'function') {
            if (isAudioMuted) {
              ytPlayer.mute();
            } else {
              ytPlayer.unMute();
              ytPlayer.setVolume(100);
            }
          }
          updateMuteUI();
        });
      }
    });

    function updateMuteUI() {
      const muteIcon = document.getElementById('muteIcon');
      const muteBtn = document.getElementById('muteBtn');
      if (!muteIcon) return;

      if (isAudioMuted) {
        muteIcon.textContent = '🔇';
        if (muteBtn) muteBtn.classList.add('is-muted');
      } else {
        muteIcon.textContent = '🔊';
        if (muteBtn) muteBtn.classList.remove('is-muted');
      }
    }

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    }

     function changeDecade(decade) {
     if (decade !== '80s' && decade !== '70s' && decade !== '60s') return;

      selectedDecade = decade;
      if (decade === '80s') {
        activeList = isShuffleOn ? shuffledPlaylist1 : originalPlaylist1;
        //currentIndex = 0;  
      }
      else if (decade === '70s') {
        activeList = isShuffleOn ? shuffledPlaylist2 : originalPlaylist2;
        //currentIndex = 0;
      }
      else {
        activeList = isShuffleOn ? shuffledPlaylist3 : originalPlaylist3;
        //currentIndex = 0;
      }
        
      currentIndex = 0;
      const id = activeList[currentIndex];
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(id);
      }
      updateUI();
    }

    
    function updateUI() {
      const activeList = getCurrentPlaylist();
      const id = activeList[currentIndex];
      document.getElementById('trackThumb').src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      fetchTrackTitle();
    }

    function fetchTrackTitle() {
      try {
        const activeList = getCurrentPlaylist();
        const videoId = activeList[currentIndex]; 
        const track = localPlaylistData[videoId];

        const shuffleIcon = isShuffleOn ? '\u{1F500}' : '\u{27A1}';
        const trackNumber = currentIndex + 1;
        const totalTracks = activeList.length;

        if (track) {
          document.getElementById('trackTitle').innerText = track.Title;
          document.getElementById('trackTitle').Title = track.Title;

          const metaElem = document.getElementById('playerMeta');
          if (metaElem) {
            metaElem.innerText = `${track.Singer} • ${track.Year} • ${trackNumber}/${totalTracks} ${shuffleIcon}`;
          }
        }
      } catch (err) {
        console.error("Error inside fetchTrackTitle:", err);
      }
    }

    function togglePlay() {
      if (!ytPlayer) return;
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    }


    function jumpToTrack(val) {
      let num = parseInt(val, 10);
      if (isNaN(num)) return;

      const activeList = getCurrentPlaylist();
      if (num < 1) num = 1;
      if (num > activeList.length) num = activeList.length;

      currentIndex = num - 1;
      renderTrackChange();
    }

    function togglePlay() {
      if (!ytPlayer) return;

      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.blur();

      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
      updateUI();
    }

    /* function toggleShuffle() {
      isShuffleOn = !isShuffleOn;
      const btn = document.getElementById('shuffleBtn');
      if (btn) {
        btn.classList.toggle('is-active', isShuffleOn);
        btn.blur();
      }
      renderTrackChange();
      if (!ytPlayer) return; ytPlayer.pauseVideo(); setTimeout(() => ytPlayer.playVideo(), 1500);
    }  */
   function toggleShuffle(decade, index) {
       //const avtivePlaylist = list;
  isShuffleOn = !isShuffleOn;
  const btn = document.getElementById('shuffleBtn');
  if (btn) {
    if (isShuffleOn) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  }
  //currentIndex = index;     
  changeDecade(decade);          
}


    function flashButton(btn) {
      if (!btn || !(btn instanceof HTMLElement)) return;
      if (btn._timer) clearTimeout(btn._timer);
      btn.classList.add('is-pressed');
      btn._timer = setTimeout(function() {
        btn.classList.remove('is-pressed');
        btn.blur();
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 1000);
    }

    function nextTrack(e) {
      if (e && e.preventDefault) e.preventDefault();
      const btn = e ? (e.currentTarget || e.target) : null;
      flashButton(btn);

      const activeList = getCurrentPlaylist();
      currentIndex = (currentIndex + 1) % activeList.length;
      renderTrackChange();
      if (!ytPlayer) return; ytPlayer.pauseVideo(); setTimeout(() => ytPlayer.playVideo(), 1500);
    }

    function prevTrack(e) {
      if (e && e.preventDefault) e.preventDefault();
      const btn = e ? (e.currentTarget || e.target) : null;
      flashButton(btn);

      const activeList = getCurrentPlaylist();
      currentIndex = (currentIndex - 1 + activeList.length) % activeList.length;
      renderTrackChange();
      if (!ytPlayer) return; ytPlayer.pauseVideo(); setTimeout(() => ytPlayer.playVideo(), 1500);
    }

    function renderTrackChange() {
      const activeList = getCurrentPlaylist();	
      const id = activeList[currentIndex];
      const thumb = document.getElementById('trackThumb');

      if (thumb) {
        thumb.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }

      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(id);
      }
      updateUI();
    }
	  
    document.addEventListener('DOMContentLoaded', function() {
      const buttons = document.querySelectorAll('.controls button');
      buttons.forEach(function(btn) {
        btn.addEventListener('touchend', function() {
          setTimeout(() => btn.blur(), 50);
        });
      });
    });  

    function setVolume(val) {
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(val);
      }
    }

    function playNextOrRandom() {
      const activeList = getCurrentPlaylist();
      currentIndex = (currentIndex + 1) % activeList.length;
      renderTrackChange();
    } 

    let initialLoad = true;
    function onPlayerStateChange(event) {
      const btn = document.getElementById('playBtn');

      if (initialLoad && event.data === YT.PlayerState.PLAYING) {
        initialLoad = false;

        event.target.pauseVideo();
        event.target.unMute();
        event.target.setVolume(100);

        isAudioMuted = false;

        btn.innerText = '▶';
        btn.classList.add('is-paused');

        updateMuteUI();
        updateUI(event);

        return;
      }

      if (event.data === YT.PlayerState.PLAYING) {
        btn.innerText = '⏸';
        btn.classList.remove('is-paused');
        document.getElementById('trackThumb').classList.add('is-playing');
        fetchTrackTitle();

      } else if (event.data === YT.PlayerState.PAUSED) {
        btn.innerText = '▶';
        btn.classList.add('is-paused');
        document.getElementById('trackThumb').classList.remove('is-playing');

      } else if (event.data === YT.PlayerState.ENDED) {
        document.getElementById('trackThumb').classList.remove('is-playing');
        advanceToNextTrack();
      }
    }   

    function advanceToNextTrack() {
      const activeList = getCurrentPlaylist();  
      currentIndex = (currentIndex + 1) % activeList.length;
      renderTrackChange();
    }

    function onPlayerError(event) {
      console.warn(`Track ${currentIndex + 1} is unplayable. Skipping...`);
      playNextOrRandom();
    }
    
    let currentCount = Math.floor(Math.random() * (25 - 10 + 1)) + 10;

    function updateFakeListeners() {
      const countElem = document.getElementById('listenerCount');
      if (countElem) {
        countElem.innerText = `Online: ${currentCount}`;
        const delta = Math.floor(Math.random() * 5) - 2;
        currentCount = Math.max(5, currentCount + delta);
      }
    }
    updateFakeListeners();
    setInterval(updateFakeListeners, 15000);

     /* Sleep Timer Logic */
    let sleepTimer = null, sleepRemain = 0;

    function openSleep() { 
      document.getElementById('sleepModal').classList.add('show'); 
    }

    function closeSleep() { 
      document.getElementById('sleepModal').classList.remove('show'); 
    }

    function setSleep(mins) {
      closeSleep();
      if (sleepTimer) clearInterval(sleepTimer);
      
      const btn = document.getElementById('sleepBtn');
      
      if (mins === 0) { 
        //btn.innerHTML = '🌙 Sleep timer'; 
        btn.innerHTML = '🌙 <span class="timer-text"> Sleep timer </span>';
        return; 
      }
      
      sleepRemain = mins * 60;
      btn.innerHTML = `🌙 ${mins}:00`;
      
      sleepTimer = setInterval(() => {
        sleepRemain--;
        let m = Math.floor(sleepRemain / 60);
        let s = sleepRemain % 60;
        btn.innerHTML = `🌙 ${m}:${String(s).padStart(2, '0')}`;
        
        if (sleepRemain <= 0) {
          clearInterval(sleepTimer);
          if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
            ytPlayer.pauseVideo();
          }
          //btn.innerHTML = '🌙 Sleep timer';
          btn.innerHTML = ' 🌙 <span class="timer-text"> Sleep timer</span>';
        }
      }, 1000);
    }
   
    
      document.addEventListener('click', function(e) {
      const container = document.querySelector('.timer-container');
      if (container && !container.contains(e.target)) {
        document.getElementById('sleepMenu').classList.remove('is-open');
      }
    });    
