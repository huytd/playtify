import React from 'react'

let musicPlayer = null;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songTime: 0,
      isPlaying: false,
      currentSong: 0
    }
  }

  onPlayClick(url) {
    let self = this;
    console.log('Requesting: ', url);
    fetch("/stream?url=" + url).then((response) => {
      return response.json()
    }).then((data) => {
      if (musicPlayer) {
        console.log(musicPlayer);
        musicPlayer.pause();
        musicPlayer.removeEventListener('timeupdate', self.timeUpdate.bind(this));
      }
      musicPlayer = new Audio(data.url);
      musicPlayer.play();
      musicPlayer.addEventListener('timeupdate', self.timeUpdate.bind(this));
    });
  }

  timeUpdate(event) {
    console.log('Time: ', musicPlayer.currentTime, '/', musicPlayer.duration);
    let percent = musicPlayer.currentTime / musicPlayer.duration * 100;
    console.log('Percent: ', percent);
    this.setState({ songTime: percent });
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
                    <input type="text" placeholder="Search song here" />
                  </div>
                  <ul className="searchList">
                    <li>
                      <button className="iconBtn entypo-plus"></button>
                      <div className="songName">
                        Pokemon Theme Song
                        <span>Jason Paige</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="playList">
                  <div className="playListNavigator">
                    <span className="entypo-note-beamed"> Now Playing</span>
                  </div>
                  <div className="playListHeader">
                    <img src="https://i.kinja-img.com/gawker-media/image/upload/s--D3WNOllh--/c_fit,fl_progressive,q_80,w_636/1364737068378998561.gif" />
                    <div className="playListInfo">
                      <h3>Pokemon Songs</h3>
                      <div>Songs: 3</div>
                    </div>
                    <div className="playListUtils">
                    </div>
                  </div>
                  <ul className="songList">
                    <li>
                      <button className="iconBtn entypo-play" onClick={this.onPlayClick.bind(this, 'http://chiasenhac.vn/mp3/us-uk/us-pop/pokemon-theme~pokemon~tssmcvwrq8v29a.html')}></button>
                      <div className="songName">
                        Pokemon Theme Song
                        <span>Jason Paige</span>
                        <button className="iconBtn entypo-cancel"></button>
                      </div>
                    </li>
                    <li>
                      <button className="iconBtn entypo-play" onClick={this.onPlayClick.bind(this, 'http://chiasenhac.vn/mp3/other/o-dance-remix/pikachu-song-if-pokemon-go~various-artists~tsvtz0ttqf1nff.html')}></button>
                      <div className="songName">
                        Pikachu Song: If Pokemon Go
                        <span>Various Artist</span>
                        <button className="iconBtn entypo-cancel"></button>
                      </div>
                    </li>
                    <li>
                      <button className="iconBtn entypo-play" onClick={this.onPlayClick.bind(this, 'http://chiasenhac.vn/mp3/japan/j-pop/world-of-pokemon~pokemon~tsvtvwcrqf29va.html')}></button>
                      <div className="songName">
                        World Of Pokemon
                        <span>Nintendo</span>
                        <button className="iconBtn entypo-cancel"></button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="player">
              <button className="playerControlBtn entypo-play"></button>
              <div className="progressBarRegion">
                <div className="progressBar">
                  <span className="progress" style={durationStyle}></span>
                </div>
              </div>
              <div className="timeStatus">02:02</div>
              <button className="playerControlBtn entypo-fast-backward"></button>
              <button className="playerControlBtn entypo-fast-forward"></button>
            </div>
          </div>
        </div>
        )
  }
}

export default App
