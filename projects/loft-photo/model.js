const PERM_FRIENDS = 2;
const PERM_PHOTOS = 4;
const APP_ID = 51645229


export default {
  getRandomElement(array) {
    if (array.length == 0) {
      return null;
    }
    let randomNum = parseInt(Math.random() * array.length - 1);
    return array[randomNum];
  },

  async getNextPhoto() {
    const friend = this.getRandomElement(friendsDB);
    const photos = await this.getFriendPhotos(friend.id); 
    const photo = this.getRandomElement(photos.items);
    const size = this.findSize(photo);

    return {friend, url:photo.url, url:size.url}
  },
  
login(){
  return new Promise((resolve,reject)=>{
    VK.init({
      apiId: APP_ID
    })
  })
  
    function auth(){
      return new Promise ((resolve,reject)=>{
        VK.auth.login(data =>{
          if (data.session){
            resolve();
          }else{
            reject(new Error('Не удалось авторизоваться'));
          }
        },2)
        })
      }
      auth().then(()=>console.log('ok'));
  },
  
  callApi(method, params){
    params.v = params.v || '5.128';
  
    return new Promise((resolve, reject) =>{
      VK.api(method, pframs,(response)=>{
        if(response.error){
          reject(new Error(response.error.error_msg));
        }else{
          resolve(response.response);
        }
      })
    })
  },
  
  async init() {
    this.photoCache={};
    this.friends = await this.getFriends();
  },
  
  getPhotos(owner){
    const params = {
      owner_id: owner,
    }
    return this.callApi('photos.getAll', params);
  },
  
  findSize(photo){
    const size = photo.sizes.find((size)=>size.width >=360);
  
    if(!size){
      return photo.sizes.reduce((biggest, current)=>{
        if (current.width>biggest.width){
        return current;
        }
        return biggest; 
    },photo.sizes[0]);
    }
  },
  
  photoCache: {},
  
  async getFriendPhotos(id) {
    const photos = this.photoCache[id];
  
    if (photos) {
      return photos;
    }else{
      photos = await this.getPhotos(id);
    }
  
    
  
    this.photoCache[id] = photos;
  
    return photos;
  },
  
  getFriends(){
    const params = {
      fields: ['photo_50', 'photo_100'],
    }
  
    return this.callApi('friends.get', params); 
  }
};
