import React from 'react'

let musicPlayer = null;

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
      searchList: [],
      songList: savedSongs || [],
      isShuffle: false
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

  nextSong(direction = 1) {
    let self = this;
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
      self.playSong(data.url);
      self.setState({ currentSong: idx });
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
    fetch('/search?query=' + term)
    .then((response) => {
      return response.json()
    })
    .then((data) => { 
      self.setState({ searchList: data.content })
    });
  }

  searchBoxKeyPress(e) {
    let self = this;
    if ((e.which || e.keyCode) == 13) {
      self.doSearch(e.target.value.replace(/ /g, '+'));
    }
  }

  onAddSongClick(item) {
    let self = this;
    let song = {
      name: item[1],
      url: 'http://chiasenhac.vn/' + item[0],
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
                  <ul className="searchList">
                    {self.state.searchList.map((searchItem, searchIndex) => {
                      return (
                        <li key={`song-search-${searchIndex}`}>
                          <button className="iconBtn entypo-plus" onClick={self.onAddSongClick.bind(self, searchItem)}></button>
                          <div className="songName">
                            {searchItem[1]}
                            <span>{searchItem[2]} - {searchItem[0].split('/')[0].toUpperCase()}</span>
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
              <button className={self.state.isPlaying?"playerControlBtn entypo-pause":"playerControlBtn entypo-play"}></button>
              <div className="progressBarRegion">
                <div className="progressBar">
                  <span className="progress" style={durationStyle}></span>
                </div>
              </div>
              <div className="timeStatus">02:02</div>
              <button className="playerControlBtn entypo-fast-backward" onClick={self.prevSong.bind(self)}></button>
              <button className="playerControlBtn entypo-fast-forward" onClick={self.nextSong.bind(self, 1)}></button>
            </div>
          </div>
        </div>
        )
  }
}

export default App
