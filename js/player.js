/*
* yPlayer
* Author yangzj1992
*/
"use strict"
Vue.config.debug = true;
var vm = new Vue({
  el: '#ym-player',
  data:{
    song_name:'',
    album_name:'',
    artist_name:'',
    showlrc: [],
    musicArray:'',
    playingMusic:'',
    playingIndex:'',
    havevoice:true,
    playStatus:true,
    prevIndex:'',
    prevMusic:'',
    followIndex:'',
    followMusic:'',
    volume:0.5,
    curtime:'00:00',
    musictime:'00:00',
    loaded:false
  },
  created: function () {
    this.loadMusic();
  },
  methods: {
    getJSON:function(url) {
      let promise = new Promise(function(resolve, reject){
        let client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.responseType = "json";
        client.setRequestHeader("Accept", "application/json");
        client.send();function handler() {if ( this.readyState !== 4 ) {return;}if (this.status === 200) {resolve(this.response);} else {reject(new Error(this.statusText));}};
      });
      return promise;
    },
    changePlay:function(){
      if(this.playStatus == false){
        this.playStatus = true;
        this.$els.mplayer.play();
      }else{
        this.playStatus = false;
        this.$els.mplayer.pause();
      }
    },
    loadMusic:function(id){
      let url = id? 'getSong.php?id='+id : 'getSong.php?id=0';
      this.getJSON(url).then(function(data) {
        vm.musicArray = data.tracks;
        vm.musicLength = vm.musicArray.length;
        vm.$els.album.style.backgroundImage = 'url('+data.cover+')';
        if (data.lrc != "no") {
          vm.showlrc = data.lrc;
        } else {
          vm.showlrc = {"0":"暂无歌词"}
        }
        vm.song_name = data.music_name;
        vm.album_name = data.album_name;
        vm.artist_name = data.artists;
        vm.playingMusic = data.id;
        vm.playingIndex = data.index;
        vm.loaded = true;
        vm.$els.mplayer.setAttribute("src", data.mp3);
        vm.$els.mplayer.volume = 0.5;
        vm.$els.mplayer.play();
      }, function(error) {
        alert('服务器通信异常');
      });
    },
    changeVoice:function(event){
      this.$els.mplayer.volume = event.target.value / 10;
      if(event.target.value == 0){
        this.havevoice = false;
      }else{
        this.havevoice = true;
        this.volume = event.target.value;
      }
    },
    changeSound:function(){
      if(this.havevoice == true){
        this.havevoice = false;
        this.$els.mplayer.volume = 0;
        this.$els.soundrange.value = 0;
      }else{
        this.havevoice = true;
        this.$els.mplayer.volume = this.volume/10;
        this.$els.soundrange.value = this.volume;
      }
    },
    nextMusic:function(){
      var random_index;
      var random_id;
      if(!this.followMusic || !this.followIndex){
        random_index = Math.ceil(Math.random()*this.musicLength);
        random_id = this.musicArray[random_index].id;
      }else{
        random_index = this.followIndex;
        random_id = this.followMusic;
      }
      this.followIndex = '';
      this.followMusic = '';
      this.prevMusic = this.playingMusic;
      this.prevIndex = this.playingIndex;
      this.showlrc = [];
      this.getJSON('getLyrics.php?id='+random_id).then(function(data) {
        if (data.lrc != "no") {
          vm.showlrc= data.lrc;
        } else {
          vm.showlrc= {"0":"暂无歌词"} ;
        }
      }, function(error) {
        alert('服务器通信异常');
      });
      let artists_name = '';
      for(let i in this.musicArray[random_index].artists){
        artists_name += this.musicArray[random_index].artists[i].name 
      }
      this.$els.album.style.backgroundImage = 'url('+this.musicArray[random_index].album.picUrl+')';
      this.playingMusic = this.musicArray[random_index].id;
      this.playingIndex = random_index;
      this.song_name = this.musicArray[random_index].name;
      this.album_name = this.musicArray[random_index].album.name;
      this.artist_name = artists_name;
      let mp3_address = this.musicArray[random_index].mp3Url;
      this.$els.mplayer.setAttribute("src", mp3_address);
      this.$els.mplayer.volume = 0.5;
      this.$els.mplayer.play();
      this.playStatus = true;
    },
    backMusic:function(){
      if(!this.prevMusic || !this.prevIndex){
        return false;
      }
      this.followIndex = this.playingIndex;
      this.followMusic = this.playingMusic;
      this.showlrc = [];
      this.getJSON('getLyrics.php?id='+this.prevMusic).then(function(data) {
        if (data.lrc != "no") {
          vm.showlrc= data.lrc;
        } else {
          vm.showlrc= {"0":"暂无歌词"};
        }
      }, function(error) {
        alert('服务器通信异常');
      });
      let artists_name = '';
      for(let i in this.musicArray[this.prevIndex].artists){
        artists_name += this.musicArray[this.prevIndex].artists[i].name 
      }
      this.$els.album.style.backgroundImage = 'url('+this.musicArray[this.prevIndex].album.picUrl+')';
      this.playingMusic = this.musicArray[this.prevIndex].id;
      this.playingIndex = this.prevIndex;
      this.song_name = this.musicArray[this.prevIndex].name;
      this.album_name = this.musicArray[this.prevIndex].album.name;
      this.artist_name = artists_name;
      let mp3_address = this.musicArray[this.prevIndex].mp3Url;
      this.prevMusic = '';
      this.prevIndex = '';
      this.$els.mplayer.setAttribute("src", mp3_address);
      this.$els.mplayer.volume = 0.5;
      this.$els.mplayer.play();
      this.playStatus = true;
    },
    getMusic:function(){
      let m_second,m_minute;
      let temp_minute = parseInt(this.$els.mplayer.duration / 60);
      if(temp_minute.toString().length > 1){
        m_minute = '' + temp_minute;
      }else{
        m_minute = '0' + temp_minute;
      }
      let temp_second = parseInt(this.$els.mplayer.duration % 60);
      if(temp_second.toString().length > 1){
        m_second = '' + temp_second;
      }else{
        m_second = '0' + temp_second;
      }
      this.musictime = m_minute + ':' + m_second;
    },
    playEvent:function(){
      if(this.$els.mplayer.buffered.length == 0){
        return false;
      }
      let c_second,c_minute;
      let temp_minute = parseInt(this.$els.mplayer.currentTime / 60);
      if(temp_minute.toString().length > 1){
        c_minute = '' + temp_minute;
      }else{
        c_minute = '0' + temp_minute;
      }
      let temp_second = parseInt(this.$els.mplayer.currentTime % 60);
      if(temp_second.toString().length > 1){
        c_second = '' + temp_second;
      }else{
        c_second = '0' + temp_second;
      }
      this.curtime = c_minute + ':' + c_second;
      let play_time = Math.floor(this.$els.mplayer.currentTime).toString();
      this.display_lrc(play_time);
      let buffer_percent = this.$els.mplayer.buffered.end(0) / this.$els.mplayer.duration;
      let current_percent = this.$els.mplayer.currentTime / this.$els.mplayer.duration;
      this.$els.buffer.style.transform = "scaleX("+buffer_percent+")"
      this.$els.playtime.style.transform = "scaleX("+current_percent+")"
    },
    changeProgress:function(event){
      let progressX = event.clientX - this.$els.progress.getBoundingClientRect().left;
      this.$els.mplayer.currentTime = parseInt(progressX/240*this.$els.mplayer.duration)
    },
    display_lrc:function(play_time) {
      if(this.$els.mplayer.buffered.length == 0){
        return false;
      }
      let lrcs = document.getElementsByClassName('lrc');
      for(let i = 0;i<lrcs.length;i++){
        if(i+1 < lrcs.length){
          if(lrcs[i].getAttribute('dtime') <= this.$els.mplayer.currentTime && this.$els.mplayer.currentTime < lrcs[i+1].getAttribute('dtime')){
            if(lrcs[i].classList){
              lrcs[i].classList.add('lrc-current');
            }else{
              lrcs[i].className += ' ' + 'lrc-current';
            }
            if(lrcs[i].offsetTop > 200){
              this.$els.lyricbox.scrollTop = lrcs[i].offsetTop - 200;
            }
          }else{
            if (lrcs[i].classList){
              lrcs[i].classList.remove('lrc-current');
            }else{
              lrcs[i].className = lrcs[i].className.replace(new RegExp('(^|\\b)' + 'lrc-current'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');//ie8
            }
          }
        }
      }
      if(lrcs[lrcs.length-1].getAttribute('dtime') <= this.$els.mplayer.currentTime){
        if(lrcs[lrcs.length-1].classList){
          lrcs[lrcs.length-1].classList.add('lrc-current');
        }else{
          lrcs[lrcs.length-1].className += ' ' + 'lrc-current';
        }
      }
    }
  }
})
  
  
