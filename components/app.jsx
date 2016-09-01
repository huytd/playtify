import React from 'react'

let musicPlayer = null;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songTime: 0,
      isPlaying: false
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
                <div className="lyrics">
                  <p>I wanna be the very best<br/>
                    Like no one ever was<br/>
                    To catch them is my real test<br/>
                    To train them is my cause</p>

                    <p>I will travel across the land<br/>
                    Searching far and wide<br/>
                    Each Pokemon to understand<br/>
                    The power that's inside<br/>
                    Pokemon, gotta catch 'em all<br/>
                    Its you and me<br/>
                    I know it's my destiny<br/>
                    Pokemon, oh, you're my best friend<br/>
                    In a world we must defend<br/>
                    Pokemon, gotta catch 'em all<br/>
                    A heart so true<br/>
                    Our courage will pull us through1</p>

                    <p>You teach me and I'll teach you<br/>
                    Pokemon, gotta catch 'em all<br/>
                    Gotta catch 'em all<br/>
                    Yeah</p>

                    <p>Every challenge along the way<br/>
                    With courage I will face<br/>
                    I will battle every day<br/>
                    To claim my rightful place</p>

                    <p>Come with me, the time is right<br/>
                    There's no better team<br/>
                    Arm in arm we'll win the fight<br/>
                    It's always been our dream</p>

                    <p>Pokemon, gotta catch 'em all<br/>
                    Its you and me<br/>
                    I know it's my destiny<br/>
                    Pokemon, oh, you're my best friend<br/>
                    In a world we must defend<br/>
                    Pokemon, gotta catch 'em all<br/>
                    A heart so true<br/>
                    Our courage will pull us through</p>

                    <p>You teach me and I'll teach you<br/>
                    Pokemon, gotta catch 'em all<br/>
                    Gotta catch 'em all<br/>
                    Gotta catch 'em all<br/>
                    Gotta catch 'em all<br/>
                    Yeah</p>
                  </div>
                </div>
                <div className="playList">
                  <div className="playListNavigator">
                    <span className="entypo-left-open"> Back to lists</span>
                  </div>
                  <div className="playListHeader">
                    <img src="https://i.kinja-img.com/gawker-media/image/upload/s--D3WNOllh--/c_fit,fl_progressive,q_80,w_636/1364737068378998561.gif" />
                    <div className="playListInfo">
                      <h3>Pokemon Songs</h3>
                      <div>Songs: 3</div>
                    </div>
                    <div className="playListUtils">
                      <button className="iconBtn entypo-plus"></button>
                    </div>
                  </div>
                  <ul className="songList">
                    <li>
                      <button className="iconBtn entypo-play" onClick={this.onPlayClick.bind(this, 'http://chiasenhac.vn/mp3/us-uk/us-pop/pokemon-theme~pokemon~tssmcvwrq8v29a.html')}></button>
                      <div className="songName">
                        Pokemon Theme Song
                        <span>Jason Paige</span>
                      </div>
                    </li>
                    <li>
                      <button className="iconBtn entypo-play" onClick={this.onPlayClick.bind(this, 'http://chiasenhac.vn/mp3/other/o-dance-remix/pikachu-song-if-pokemon-go~various-artists~tsvtz0ttqf1nff.html')}></button>
                      <div className="songName">
                        Pikachu Song: If Pokemon Go
                        <span>Various Artist</span>
                      </div>
                    </li>
                    <li>
                      <button className="iconBtn entypo-play" onClick={this.onPlayClick.bind(this, 'http://chiasenhac.vn/mp3/japan/j-pop/world-of-pokemon~pokemon~tsvtvwcrqf29va.html')}></button>
                      <div className="songName">
                        World Of Pokemon
                        <span>Nintendo</span>
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
