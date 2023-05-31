const PERM_FRIENDS = 2;
const PERM_PHOTOS = 4;
const APP_ID = 51645229;

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

    return { friend, url: photo.url, url: size.url };
  },

  login() {
    return new Promise((resolve, reject) => {
      VK.init({
        apiId: APP_ID,
      });

      VK.Auth.login((response) => {
        if (response.session) {
          this.token = response.session.sid;
          resolve(response);
        } else {
          console.error(response);
          reject(response);
        }
      }, PERM_FRIENDS | PERM_PHOTOS);
    });

    function auth() {
      return new Promise((resolve, reject) => {
        VK.auth.login((data) => {
          if (data.session) {
            resolve();
          } else {
            reject(new Error('Не удалось авторизоваться'));
          }
        }, 2);
      });
    }
    auth().then(() => console.log('ok'));
  },

  logout() {},

  getFriends() {},

  getUsers(ids) {
    const params = {
      fields: ['photo_50', 'photo_100'],
    };
    if (ids) {
      params.user_ids = ids;
    }
    return this.callApi('users.get', params);
  },

  logout() {
    return new Promise((resolve) => VK.Auth.revokeGrants(resolve));
  },

  callApi(method, params) {
    params.v = params.v || '5.128';

    return new Promise((resolve, reject) => {
      VK.api(method, pframs, (response) => {
        if (response.error) {
          reject(new Error(response.error.error_msg));
        } else {
          resolve(response.response);
        }
      });
    });
  },

  async init() {
    this.photoCache = {};
    this.friends = await this.getFriends();
    [this.me] = await this.getUsers();
  },

  getPhotos(owner) {
    const params = {
      owner_id: owner,
    };
    return this.callApi('photos.getAll', params);
  },

  findSize(photo) {
    const size = photo.sizes.find((size) => size.width >= 360);

    if (!size) {
      return photo.sizes.reduce((biggest, current) => {
        if (current.width > biggest.width) {
          return current;
        }
        return biggest;
      }, photo.sizes[0]);
    }
  },

  photoCache: {},

  async getFriendPhotos(id) {
    const photos = this.photoCache[id];

    if (photos) {
      return photos;
    } else {
      photos = await this.getPhotos(id);
    }

    this.photoCache[id] = photos;

    return photos;
  },

  getFriends() {
    const params = {
      fields: ['photo_50', 'photo_100'],
    };

    return this.callApi('friends.get', params);
  },
  async callServer(method, queryParams, body) {
    queryParams = {
      ...queryParams,
      method,
    };
    const query = Object.entries(queryParams)
      .reduce((all, [name, value]) => {
        all.push(`${name}=${encodeURIComponent(value)}`);
        return all;
      }, [])
      .join('&');
    const params = {
      headers: {
        vk_token: this.token,
      },
    };

    if (body) {
      params.method = 'PDST';
      params.body = JSON.stringify(body);
    }

    const response = await fetch(`/loft-photo/api/?${query}`, params);
    return response.json();
  },


  async like(photo) {
    return this.callServer('like', {photo});
  },

  async photoStats(photo) {
    return this.callServer('photoStats', {photo});
  },

  async getComments(photo) {
    return this.callServer('getComments', {photo});
  },

  async postComment(photo, text) {
    return this.callServer('postComment', {photo},{text});
  },
};
