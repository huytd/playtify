import React from 'react'

let musicPlayer = null;

const debounce = (func, wait, immediate) => {
  let timeout;
  return function() {
    let context = this, args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);
    let savedSongs = window.localStorage.getItem("songList") || null;
    if (savedSongs) {
      savedSongs = JSON.parse(savedSongs);
    }
    this.state = {
      songTime: 0,
      isPlaying: false,
      currentSong: 0,
      searchList: {
        csn: [],
        zing: []
      },
      songList: savedSongs || [],
      shuffleArray: [],
      isShuffle: false,
      isSearchInProgress: false
    }
  }

  playSong(url) {
    let self = this;
    if (musicPlayer) {
      musicPlayer.removeEventListener('timeupdate', self.timeUpdate.bind(self));
      musicPlayer.pause()
    }
    musicPlayer = new Audio(url);
    musicPlayer.play();
    musicPlayer.addEventListener('timeupdate', self.timeUpdate.bind(self));
    self.setState({ isPlaying: true });
  }
  
  pauseSong() {
    let self = this;
    if (musicPlayer) {
      musicPlayer.pause()
      self.setState({ isPlaying: false });
    }
  }

  resumeSong() {
    let self = this;
    musicPlayer.play();
    self.setState({ isPlaying: true });
  }

  toggleShuffle() {
    let self = this;
    self.setState({ isShuffle: !self.state.isShuffle });
  }
  
  nextSong(direction = 1) {
    let self = this;
    const limitRate = debounce(() => {
      let songIdx = self.state.currentSong;
      if (self.state.isShuffle) {
        if (self.state.shuffleArray.length == 0) {
          self.state.shuffleArray = self.state.songList.map((s, i) => { return i; });
        }
        let ridx = Math.floor(Math.random() * (self.state.shuffleArray.length - 1));
        songIdx = self.state.shuffleArray[ridx];
        let newShuffleArray = self.state.shuffleArray;
        newShuffleArray.splice(ridx, 1);
        self.setState({ shuffleArray: newShuffleArray });
      } else {
        songIdx += direction;
        if (songIdx >= self.state.songList.length) {
          songIdx = 0;
        }
        if (songIdx <= 0) {
          songIdx = self.state.songList.length - 1;
        }
      }
      self.onPlayClick(songIdx);
    }, 250);
    limitRate();
  }

  prevSong() {
    let self = this;
    self.nextSong(-1);
  }

  onPlayClick(idx) {
    let self = this;
    let song = self.state.songList[idx];
    document.title = 'Playing: ' + song.name + ' - ' + song.artist;
    fetch('/stream?url=' + song.url)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      console.log('Song URL: ', data.url);
      if (data.url != "ERR") {
        self.playSong(data.url);
        self.setState({ currentSong: idx });
      } else {
        self.nextSong();
      }
    })
    .catch((error) => {
      console.log('ERROR: ', error);
      self.nextSong();
    });
  }

  componentDidMount() {
    let self = this;
    self.doSearch('');
  }

  timeUpdate(event) {
    let self = this;
    console.log('Time: ', musicPlayer.currentTime, '/', musicPlayer.duration);
    let percent = musicPlayer.currentTime / musicPlayer.duration * 100;
    console.log('Percent: ', percent);
    self.setState({ songTime: percent });
    if (percent >= 100) {
      self.nextSong();
    }
  }

  doSearch(term) {
    let self = this;
    self.setState({ 
      isSearchInProgress: true,
      searchList: {
        csn: [],
        zing: []
      }
    });
    fetch('/search?query=' + term)
    .then((response) => {
      return response.json()
    })
    .then((data) => { 
      let contentArray = data.content;
      if (!contentArray) contentArray = {};
      if (!contentArray.csn) contentArray.csn = [];
      if (!contentArray.zing) contentArray.zing = [];
      self.setState({ 
        isSearchInProgress: false,
        searchList: contentArray
      });
    });
  }

  searchBoxKeyPress(e) {
    let self = this;
    if ((e.which || e.keyCode) == 13) {
      self.doSearch(e.target.value.replace(/ /g, '+'));
    }
  }

  onAddSongClick(item, appendPrefix) {
    let self = this;
    let song = {
      name: item[1].replace('-&nbsp;', ''),
      url: ((appendPrefix)?'http://chiasenhac.vn/':'') + item[0],
      artist: item[2]
    };
    let newSongList = self.state.songList.concat(song);
    self.setState({ songList: newSongList });
    window.localStorage.setItem('songList', JSON.stringify(newSongList));
  }

  onRemoveSongClick(index) {
    let self = this;
    let newSongList = self.state.songList;
    newSongList.splice(index, 1);
    self.setState({ songList: newSongList });
    window.localStorage.setItem('songList', JSON.stringify(newSongList));
    if (self.state.currentSong == index) {
      self.nextSong();
    }
  }

  playerMainButtonClick() {
    let self = this;
    if (self.state.isPlaying) {
      self.pauseSong();
    } else {
      self.resumeSong();
    }
  }

  render() {
    let self = this;
    let durationStyle = {
      width: `${self.state.songTime}%`
    }
    return (
        <div className="container">
          <div className="background"></div>
          <div className="main">
            <div className="content">
              <div className="nowPlaying">
                <div className="info">
                  <div className="searchBox">
                    <input autoFocus type="text" placeholder="Search song here" onKeyPress={self.searchBoxKeyPress.bind(self)} />
                  </div>
                  <div className={self.state.isSearchInProgress?"searchLoader":"searchLoader hide"}>Searching...</div>
                  <ul className="searchList">
                    {self.state.searchList.csn.map((searchItem, searchIndex) => {
                      return (
                        <li key={`song-search-${searchIndex}`}>
                          <button className="iconBtn entypo-plus" onClick={self.onAddSongClick.bind(self, searchItem, true)}></button>
                          <div className="songName">
                            {searchItem[1]}
                            <span>{searchItem[2]} - {searchItem[0].split('/')[0].toUpperCase()}</span>
                          </div>
                        </li>
                      )
                    })}
                    {self.state.searchList.zing.map((searchItem, searchIndex) => {
                      return (
                        <li key={`song-search-${searchIndex}`}>
                          <button className="iconBtn entypo-plus" onClick={self.onAddSongClick.bind(self, searchItem, false)}></button>
                          <div className="songName">
                            {searchItem[1].replace('-&nbsp;', '')}
                            <span>{searchItem[2]}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <div className="playList">
                  <div className="playListNavigator">
                    <span className="entypo-note-beamed"> Now Playing</span>
                  </div>
                  <div className="playListHeader">
                    <img src="https://i.kinja-img.com/gawker-media/image/upload/s--D3WNOllh--/c_fit,fl_progressive,q_80,w_636/1364737068378998561.gif" />
                    <div className="playListInfo">
                      <h3>Alpha Playlist</h3>
                      <div>Songs: {self.state.songList.length}</div>
                    </div>
                    <div className="playListUtils">
                    </div>
                  </div>
                  <ul className="songList">
                    {self.state.songList.map((songItem, songIndex) => {
                      return (
                        <li key={`song-${songIndex}`} className={(self.state.currentSong == songIndex)?'active':''}>
                          <button className={((self.state.currentSong == songIndex) && self.state.isPlaying)?"iconBtn entypo-pause":"iconBtn entypo-play"} onClick={self.onPlayClick.bind(self, songIndex)}></button>
                          <div className="songName">
                            {songItem.name}
                            <span>{songItem.artist}</span>
                            <button className="iconBtn entypo-cancel" onClick={self.onRemoveSongClick.bind(self, songIndex)}></button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div className="player">
              <button className={self.state.isPlaying?"playerControlBtn entypo-pause":"playerControlBtn entypo-play"} onClick={self.playerMainButtonClick.bind(self)}></button>
              <div className="progressBarRegion">
                <div className="progressBar">
                  <span className="progress" style={durationStyle}></span>
                </div>
              </div>
              <div className="timeStatus">02:02</div>
              <button className="playerControlBtn entypo-fast-backward" onClick={self.prevSong.bind(self)}></button>
              <button className="playerControlBtn entypo-fast-forward" onClick={self.nextSong.bind(self, 1)}></button>
              <button className={self.state.isShuffle?"playerControlBtn entypo-shuffle":"playerControlBtn entypo-shuffle disabled"} onClick={self.toggleShuffle.bind(self)}></button>
            </div>
          </div>
        </div>
        )
  }
}

export default App
