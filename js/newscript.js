console.log("lets write the Javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  try {
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }

    // show all the songs in the list
    let songUL = document
      .querySelector(".songList")
      .getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
      songUL.innerHTML +=
        `<li><img class="invert" src="img/music.svg" alt="">
              <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Sanket</div>
              </div>
              <div class="playnow">
                  <span>Play Now</span>
              <img src="img/play.svg" alt="">
            </div> </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
      e.addEventListener("click", (element) => {
        console.log(e.querySelector(".info").firstElementChild.innerHTML);
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });

    return songs;
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    alert("Failed to fetch songs. Please try again later.");
    return [];
  }
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  } else {
    play.src = "img/play.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  try {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
      const e = array[index];

      if (e.href.includes("/songs/")) {
        let folder = e.href.split("/").slice(-1)[0];
        try {
          let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
          let response = await a.json();
          cardContainer.innerHTML +=
            `<div data-folder="${folder}" class="card">
          <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" fill="#000000" stroke-width="1.5"
                      stroke-linejoin="round" />
              </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
      </div>`;
        } catch (error) {
          console.error(`Failed to fetch metadata for folder ${folder}:`, error);
          alert(`Failed to fetch metadata for folder ${folder}. Please try again later.`);
        }
      }
    }

    // load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Failed to fetch albums:", error);
    alert("Failed to fetch albums. Please try again later.");
  }
}

async function main() {
  try {
    // get the list of all the songs
    await getSongs("songs/cs");
    playMusic(songs[0], true);

    // display all the albums on the page
    displayAlbums();

    // attach an event listener to play, next, and previous
    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "img/pause.svg";
      } else {
        currentSong.pause();
        play.src = "img/play.svg";
      }
    });

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(
        ".songtime"
      ).innerHTML = `${convertSecondsToMinutesSeconds(
        currentSong.currentTime
      )} / ${convertSecondsToMinutesSeconds(currentSong.duration)}`;
      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = precent + "%";
      currentSong.currentTime = (currentSong.duration * precent) / 100;
    });

    // add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0";
    });

    // add event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%";
    });

    // add event listener to previous
    previous.addEventListener("click", () => {
      currentSong.pause();
      console.log("previous is clicked");
      console.log(currentSong);
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
      }
    });

    // add event listener to next
    next.addEventListener("click", () => {
      currentSong.pause();
      console.log("next is clicked");
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    });

    // add event to volume
    document
      .querySelector(".range")
      .getElementsByTagName("input")[0]
      .addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0){
          document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
      });

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
      if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 0;
      } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currentSong.volume = 0.1;
        document
          .querySelector(".range")
          .getElementsByTagName("input")[0].value = 10;
      }
    });
  } catch (error) {
    console.error("Error initializing application:", error);
    alert("Error initializing application. Please try again later.");
  }
}

main();
