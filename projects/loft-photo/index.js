import pages from './pages';
import('./styles.css');

const pageNames = ['login', 'main', 'profile'];

document.addEventListener('click', () => {
    let randomPage =  getRandomElement(pageNames);
    pages.openPage(randomPage);
});
